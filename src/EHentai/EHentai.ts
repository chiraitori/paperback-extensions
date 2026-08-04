import {
    BadgeColor,
    Chapter,
    ChapterDetails,
    ContentRating,
    HomeSection,
    HomeSectionType,
    PagedResults,
    PartialSourceManga,
    Request,
    Response,
    SearchRequest,
    Source,
    SourceInfo,
    SourceInterceptor,
    SourceIntents,
    SourceManga,
    TagSection,
} from '@paperback/types'

const BASE_URL = 'https://e-hentai.org'
const DEFAULT_CATEGORIES = 0
const ALL_CATEGORIES = 1023
const THUMBNAILS_PER_PAGE = 20
const IMAGE_RESOLVE_BATCH_SIZE = 40

const CATEGORY_TAGS = [
    { id: 'category:2', label: 'Doujinshi', bit: 2 },
    { id: 'category:4', label: 'Manga', bit: 4 },
    { id: 'category:8', label: 'Artist CG', bit: 8 },
    { id: 'category:16', label: 'Game CG', bit: 16 },
    { id: 'category:32', label: 'Image Set', bit: 32 },
    { id: 'category:64', label: 'Cosplay', bit: 64 },
    { id: 'category:128', label: 'Asian Porn', bit: 128 },
    { id: 'category:256', label: 'Non-H', bit: 256 },
    { id: 'category:512', label: 'Western', bit: 512 },
    { id: 'category:1', label: 'Misc', bit: 1 },
]

const HOME_SECTIONS = [
    { id: 'latest', title: 'Latest Galleries', categories: DEFAULT_CATEGORIES },
    { id: 'doujinshi', title: 'Latest Doujinshi', categories: ALL_CATEGORIES - 2 },
    { id: 'manga', title: 'Latest Manga', categories: ALL_CATEGORIES - 4 },
]

interface GalleryIdentifier {
    gid: string
    token: string
}

interface GalleryPageData extends GalleryIdentifier {
    title: string
    japaneseTitle: string
    cover: string
    category: string
    uploader: string
    pageCount: number
    posted?: Date
    rating?: number
    language: string
    artist: string
    tags: TagSection[]
}

interface SearchMetadata {
    next?: string
}

const parseGalleryIdentifier = (value: string): GalleryIdentifier => {
    const match = /(?:\/g\/)?(\d+)\/([a-z0-9]+)/i.exec(value)
    if (!match?.[1] || !match[2]) {
        throw new Error(`Invalid E-Hentai gallery identifier: ${value}`)
    }

    return { gid: match[1], token: match[2] }
}

const normalizeUrl = (value: string): string => {
    if (value.startsWith('//')) return `https:${value}`
    if (value.startsWith('/')) return `${BASE_URL}${value}`
    return value
}

const extractCssUrl = (style: string): string => {
    const match = /url\((?:['"])?([^'")]+)(?:['"])?\)/i.exec(style)
    return normalizeUrl(match?.[1] ?? '')
}

const languageCodeFor = (language: string): string => {
    const codes: Record<string, string> = {
        chinese: 'zh',
        english: 'en',
        french: 'fr',
        german: 'de',
        indonesian: 'id',
        italian: 'it',
        japanese: 'jp',
        korean: 'ko',
        portuguese: 'pt',
        russian: 'ru',
        spanish: 'es',
        thai: 'th',
        turkish: 'tr',
        ukrainian: 'uk',
        vietnamese: 'vi',
    }

    return codes[language.toLowerCase()] ?? 'jp'
}

class EHentaiInterceptor implements SourceInterceptor {
    async interceptRequest(request: Request): Promise<Request> {
        request.headers = {
            ...request.headers,
            Accept: 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
            Referer: `${BASE_URL}/`,
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
        }

        const cookies = request.cookies ?? []
        if (!cookies.some(cookie => cookie.name === 'nw')) {
            cookies.push(App.createCookie({
                name: 'nw',
                value: '1',
                domain: 'e-hentai.org',
                path: '/',
            }))
        }
        request.cookies = cookies

        return request
    }

    async interceptResponse(response: Response): Promise<Response> {
        return response
    }
}

export const EHentaiInfo: SourceInfo = {
    version: '1.0.2',
    name: 'E-Hentai',
    icon: 'icon.png',
    author: 'chiraitori',
    authorWebsite: 'https://github.com/chiraitori/paperback-extensions',
    description: 'Browse and read public E-Hentai galleries with search and category filters.',
    contentRating: ContentRating.ADULT,
    websiteBaseURL: BASE_URL,
    sourceTags: [
        { text: '18+', type: BadgeColor.RED },
        { text: 'Gallery', type: BadgeColor.BLUE },
    ],
    intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.HOMEPAGE_SECTIONS,
}

export class EHentai extends Source {
    override readonly requestManager = App.createRequestManager({
        requestsPerSecond: 15,
        requestTimeout: 30000,
        interceptor: new EHentaiInterceptor(),
    })

    override getMangaShareUrl(mangaId: string): string {
        const { gid, token } = parseGalleryIdentifier(mangaId)
        return `${BASE_URL}/g/${gid}/${token}/`
    }

    override async getSearchTags(): Promise<TagSection[]> {
        return [App.createTagSection({
            id: 'categories',
            label: 'Categories',
            tags: CATEGORY_TAGS.map(category => App.createTag({
                id: category.id,
                label: category.label,
            })),
        })]
    }

    override async supportsTagExclusion(): Promise<boolean> {
        return true
    }

    override async supportsSearchOperators(): Promise<boolean> {
        return true
    }

    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const sections = HOME_SECTIONS.map(definition => App.createHomeSection({
            id: definition.id,
            title: definition.title,
            type: HomeSectionType.singleRowNormal,
            containsMoreItems: true,
        }))

        sections.forEach(sectionCallback)

        await Promise.all(sections.map(async (section, index) => {
            const definition = HOME_SECTIONS[index]
            if (!definition) return

            try {
                const page = await this.getGalleryResults('', definition.categories)
                section.items = page.results
                sectionCallback(section)
            } catch (error) {
                console.log(`[E-Hentai] Failed to load ${section.id}: ${error}`)
            }
        }))
    }

    override async getViewMoreItems(homepageSectionId: string, metadata: SearchMetadata): Promise<PagedResults> {
        const definition = HOME_SECTIONS.find(section => section.id === homepageSectionId)
        if (!definition) return App.createPagedResults({ results: [] })

        return this.getGalleryResults('', definition.categories, metadata?.next)
    }

    override async getSearchResults(query: SearchRequest, metadata: SearchMetadata): Promise<PagedResults> {
        return this.getGalleryResults(
            query.title?.trim() ?? '',
            this.categoriesForQuery(query),
            metadata?.next,
        )
    }

    override async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const gallery = await this.getGalleryPageData(mangaId)
        const titles = [gallery.title]
        if (gallery.japaneseTitle && gallery.japaneseTitle !== gallery.title) {
            titles.push(gallery.japaneseTitle)
        }

        const details = [
            gallery.category,
            gallery.pageCount > 0 ? `${gallery.pageCount} pages` : '',
            gallery.uploader ? `Uploaded by ${gallery.uploader}` : '',
        ].filter(Boolean).join(' • ')

        return App.createSourceManga({
            id: `${gallery.gid}/${gallery.token}`,
            mangaInfo: App.createMangaInfo({
                titles,
                image: gallery.cover,
                author: gallery.uploader || gallery.artist,
                artist: gallery.artist || gallery.uploader,
                desc: details || 'E-Hentai gallery',
                status: 'Completed',
                hentai: gallery.category.toLowerCase() !== 'non-h',
                rating: gallery.rating,
                tags: gallery.tags,
            }),
        })
    }

    override async getChapters(mangaId: string): Promise<Chapter[]> {
        const gallery = await this.getGalleryPageData(mangaId)
        return [App.createChapter({
            id: String(Math.max(1, gallery.pageCount)),
            name: gallery.title,
            chapNum: 1,
            langCode: gallery.language,
            time: gallery.posted,
        })]
    }

    override async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const pageCount = Math.max(1, Number.parseInt(chapterId, 10) || 1)
        const imagePageUrls = await this.getImagePageUrls(mangaId, pageCount)
        const pages: string[] = []

        for (let index = 0; index < imagePageUrls.length; index += IMAGE_RESOLVE_BATCH_SIZE) {
            const batch = imagePageUrls.slice(index, index + IMAGE_RESOLVE_BATCH_SIZE)
            const imageUrls = await Promise.all(batch.map(async url => {
                try {
                    return await this.getImageUrl(url)
                } catch (error) {
                    console.log(`[E-Hentai] Failed to resolve image page ${url}: ${error}`)
                    return ''
                }
            }))
            pages.push(...imageUrls.filter(Boolean))
        }

        if (pages.length === 0) {
            throw new Error('E-Hentai returned no readable image pages. The gallery may be unavailable or the image limit was reached.')
        }

        return App.createChapterDetails({
            id: chapterId,
            mangaId,
            pages,
        })
    }

    private categoriesForQuery(query: SearchRequest): number {
        const included = (query.includedTags ?? [])
            .map(tag => CATEGORY_TAGS.find(category => category.id === tag.id)?.bit)
            .filter((bit): bit is number => bit !== undefined)
        const excluded = (query.excludedTags ?? [])
            .map(tag => CATEGORY_TAGS.find(category => category.id === tag.id)?.bit)
            .filter((bit): bit is number => bit !== undefined)

        if (included.length > 0) {
            const includedMask = included.reduce((sum, bit) => sum + bit, 0)
            return Math.max(0, ALL_CATEGORIES - includedMask)
        }

        return excluded.reduce((sum, bit) => sum + bit, 0)
    }

    private async getGalleryResults(query: string, categories: number, next?: string): Promise<PagedResults> {
        const params = [
            `f_cats=${categories}`,
            `f_search=${encodeURIComponent(query)}`,
        ]
        if (next) params.unshift(`next=${encodeURIComponent(next)}`)

        const html = await this.get(`${BASE_URL}/?${params.join('&')}`)
        const $ = this.cheerio.load(html)
        const results: PartialSourceManga[] = []

        $('tr').each((_index, row) => {
            if ($('td.glname', row).length === 0) return

            const link = $('td.glname a[href*="/g/"]', row).first()
            const href = link.attr('href') ?? ''
            let identifier: GalleryIdentifier
            try {
                identifier = parseGalleryIdentifier(href)
            } catch {
                return
            }

            const imageElement = $('div.glthumb img', row).first()
            const image = normalizeUrl(imageElement.attr('data-src') ?? imageElement.attr('src') ?? '')
            const category = $('td.glcat div', row).first().text().trim()
            const pageText = $('td.gl4c div', row).last().text().trim()
            const uploader = $('td.gl4c a', row).first().text().trim()

            results.push(App.createPartialSourceManga({
                mangaId: `${identifier.gid}/${identifier.token}`,
                title: $('.glink', row).first().text().trim() || imageElement.attr('alt') || 'Untitled Gallery',
                image,
                subtitle: [category, pageText, uploader].filter(Boolean).join(' • '),
            }))
        })

        const nextHref = $('#unext').attr('href') ?? ''
        const nextMatch = /[?&]next=(\d+)/.exec(nextHref)

        return App.createPagedResults({
            results,
            metadata: nextMatch?.[1] ? { next: nextMatch[1] } : undefined,
        })
    }

    private async getGalleryPageData(mangaId: string): Promise<GalleryPageData> {
        const identifier = parseGalleryIdentifier(mangaId)
        const html = await this.get(`${BASE_URL}/g/${identifier.gid}/${identifier.token}/`)
        const $ = this.cheerio.load(html)

        const info: Record<string, string> = {}
        $('#gdd tr').each((_index, row) => {
            const label = $('td.gdt1', row).text().replace(':', '').trim().toLowerCase()
            const value = $('td.gdt2', row).text().trim()
            if (label) info[label] = value
        })

        const tagSections: TagSection[] = []
        const tagValues: Record<string, string[]> = {}
        $('#taglist tr').each((_index, row) => {
            const namespace = $('td.tc', row).text().replace(':', '').trim().toLowerCase()
            if (!namespace) return

            const labels: string[] = []
            $('td:not(.tc) a', row).each((_tagIndex, element) => {
                const wrappedElement: any = element as any
                const label = (typeof wrappedElement.text === 'function'
                    ? wrappedElement.text()
                    : $(element).text()).trim()
                if (label) labels.push(label)
            })
            if (labels.length === 0) return

            tagValues[namespace] = labels
            tagSections.push(App.createTagSection({
                id: namespace,
                label: namespace.charAt(0).toUpperCase() + namespace.slice(1),
                tags: labels.map(label => App.createTag({
                    id: `${namespace}:${label}`,
                    label,
                })),
            }))
        })

        const category = $('#gdc').text().trim()
        const cover = normalizeUrl($('#gd1 img').attr('src') ?? '')
            || extractCssUrl($('#gd1 div').first().attr('style') ?? '')
        const pageCount = Number.parseInt(info.length ?? '', 10) || 1
        const ratingText = $('#rating_label').text()
        const ratingMatch = /([0-9]+(?:\.[0-9]+)?)/.exec(ratingText)
        const posted = info.posted ? new Date(`${info.posted.replace(' ', 'T')}Z`) : undefined
        const language = tagValues.language?.find(value => value.toLowerCase() !== 'translated') ?? 'japanese'
        const artist = tagValues.artist?.[0] ?? tagValues.group?.[0] ?? ''

        return {
            ...identifier,
            title: $('#gn').text().trim() || 'Untitled Gallery',
            japaneseTitle: $('#gj').text().trim(),
            cover,
            category,
            uploader: $('#gdn a').first().text().trim(),
            pageCount,
            posted: posted && !Number.isNaN(posted.getTime()) ? posted : undefined,
            rating: ratingMatch?.[1] ? Number.parseFloat(ratingMatch[1]) : undefined,
            language: languageCodeFor(language),
            artist,
            tags: tagSections,
        }
    }

    private async getImagePageUrls(mangaId: string, pageCount: number): Promise<string[]> {
        const { gid, token } = parseGalleryIdentifier(mangaId)
        const urls: string[] = []
        const seen = new Set<string>()
        const expectedGalleryPages = Math.ceil(pageCount / THUMBNAILS_PER_PAGE)

        for (let page = 0; page < expectedGalleryPages + 2 && urls.length < pageCount; page++) {
            const suffix = page === 0 ? '' : `?p=${page}`
            const html = await this.get(`${BASE_URL}/g/${gid}/${token}/${suffix}`)
            const $ = this.cheerio.load(html)
            const pageUrls: string[] = []
            $('#gdt > a[href*="/s/"]').each((_linkIndex, element) => {
                const wrappedElement: any = element as any
                const href = typeof wrappedElement.attr === 'function'
                    ? wrappedElement.attr('href')
                    : $(element).attr('href')
                const url = normalizeUrl(href ?? '')
                if (url) pageUrls.push(url)
            })

            if (pageUrls.length === 0) break

            let added = 0
            for (const url of pageUrls) {
                if (seen.has(url)) continue
                seen.add(url)
                urls.push(url)
                added++
            }
            if (added === 0) break
        }

        return urls.slice(0, pageCount)
    }

    private async getImageUrl(imagePageUrl: string): Promise<string> {
        const html = await this.get(imagePageUrl)
        const $ = this.cheerio.load(html)
        return normalizeUrl($('#img').attr('src') ?? $('#i7 a').attr('href') ?? '')
    }

    private async get(url: string): Promise<string> {
        const response = await this.requestManager.schedule(App.createRequest({
            url,
            method: 'GET',
        }), 2)

        if (response.status >= 400) {
            throw new Error(`E-Hentai returned HTTP ${response.status} for ${url}`)
        }
        return response.data ?? ''
    }
}
