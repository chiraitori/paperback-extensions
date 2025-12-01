import {
    Chapter,
    ChapterDetails,
    ContentRating,
    HomeSection,
    HomeSectionType,
    SourceManga,
    PartialSourceManga,
    PagedResults,
    Request,
    Response,
    SearchRequest,
    Source,
    SourceInfo,
    TagSection,
    BadgeColor,
    SourceInterceptor,
    SourceIntents,
} from '@paperback/types'

const SERVER_URL = 'https://image.chiraitori.io.vn'

export const PixivInfo: SourceInfo = {
    version: '1.0.0',
    name: 'Pixiv',
    icon: 'icon.png',
    author: 'image-api',
    authorWebsite: 'https://github.com/image-api',
    description: 'Browse and read manga/illustrations from Pixiv via image-api proxy',
    contentRating: ContentRating.ADULT,
    websiteBaseURL: 'https://www.pixiv.net',
    sourceTags: [
        {
            text: '18+',
            type: BadgeColor.YELLOW
        },
    ],
    intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.HOMEPAGE_SECTIONS
}

export class PixivInterceptor implements SourceInterceptor {
    async interceptResponse(response: Response): Promise<Response> {
        return response
    }

    async interceptRequest(request: Request): Promise<Request> {
        return request
    }
}

export class Pixiv extends Source {
    requestManager = App.createRequestManager({
        requestsPerSecond: 4,
        requestTimeout: 20000,
        interceptor: new PixivInterceptor()
    })

    override getMangaShareUrl(mangaId: string): string {
        return `https://www.pixiv.net/artworks/${mangaId}`
    }

    getServerUrl(): string {
        return SERVER_URL
    }

    override async supportsTagExclusion(): Promise<boolean> {
        return false
    }

    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const serverUrl = this.getServerUrl()

        const sections = [
            App.createHomeSection({
                id: 'daily',
                title: 'Daily Ranking',
                containsMoreItems: true,
                type: HomeSectionType.singleRowNormal
            }),
            App.createHomeSection({
                id: 'weekly',
                title: 'Weekly Ranking',
                containsMoreItems: true,
                type: HomeSectionType.singleRowNormal
            }),
            App.createHomeSection({
                id: 'daily_r18',
                title: 'Daily R18',
                containsMoreItems: true,
                type: HomeSectionType.singleRowNormal
            }),
        ]

        for (const section of sections) {
            sectionCallback(section)
        }

        for (const section of sections) {
            try {
                const request = App.createRequest({
                    url: `${serverUrl}/api/ranking?mode=${section.id}`,
                    method: 'GET'
                })

                const response = await this.requestManager.schedule(request, 1)
                const data = JSON.parse(response.data ?? '{}')

                if (data.error) {
                    console.log(`Error: ${data.message}`)
                    continue
                }

                const items: PartialSourceManga[] = []
                for (const item of data.data?.contents ?? []) {
                    const pageCount = parseInt(item.illust_page_count) || 1
                    if (pageCount > 1 || item.illust_type === '1') {
                        items.push(App.createPartialSourceManga({
                            mangaId: String(item.illust_id),
                            title: item.title,
                            image: `${serverUrl}/api/image/?url=${encodeURIComponent(item.url)}`,
                            subtitle: item.user_name
                        }))
                    }
                }

                section.items = items
                sectionCallback(section)
            } catch (error) {
                console.log(`Error loading section ${section.id}: ${error}`)
            }
        }
    }

    override async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const serverUrl = this.getServerUrl()
        const page = metadata?.page ?? 1

        const request = App.createRequest({
            url: `${serverUrl}/api/ranking?mode=${homepageSectionId}&page=${page}`,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        const data = JSON.parse(response.data ?? '{}')

        const items: PartialSourceManga[] = []
        for (const item of data.data?.contents ?? []) {
            const pageCount = parseInt(item.illust_page_count) || 1
            if (pageCount > 1 || item.illust_type === '1') {
                items.push(App.createPartialSourceManga({
                    mangaId: String(item.illust_id),
                    title: item.title,
                    image: `${serverUrl}/api/image/?url=${encodeURIComponent(item.url)}`,
                    subtitle: item.user_name
                }))
            }
        }

        return App.createPagedResults({
            results: items,
            metadata: { page: page + 1 }
        })
    }

    override async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const serverUrl = this.getServerUrl()

        const request = App.createRequest({
            url: `${serverUrl}/api/illust/${mangaId}`,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        const data = JSON.parse(response.data ?? '{}')

        if (data.error) {
            throw new Error(data.message)
        }

        const illust = data.data
        const tags = (illust.tags ?? []).map((tag: any) => App.createTag({
            id: tag.tag,
            label: tag.tag
        }))

        const coverUrl = illust.urls?.regular || illust.urls?.small || ''

        return App.createSourceManga({
            id: mangaId,
            mangaInfo: App.createMangaInfo({
                titles: [illust.title],
                image: `${serverUrl}/api/image/?url=${encodeURIComponent(coverUrl)}`,
                author: illust.userName,
                artist: illust.userName,
                desc: illust.description || 'No description',
                status: 'Completed',
                tags: [App.createTagSection({
                    id: 'tags',
                    label: 'Tags',
                    tags: tags
                })]
            })
        })
    }

    override async getChapters(mangaId: string): Promise<Chapter[]> {
        return [
            App.createChapter({
                id: mangaId,
                name: 'Full Work',
                chapNum: 1,
                langCode: 'jp'
            })
        ]
    }

    override async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const serverUrl = this.getServerUrl()

        const request = App.createRequest({
            url: `${serverUrl}/api/illust/${chapterId}?pages=true`,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        const data = JSON.parse(response.data ?? '{}')

        if (data.error) {
            throw new Error(data.message)
        }

        const pages: string[] = []
        for (const page of data.data ?? []) {
            const imageUrl = page.original || page.regular || ''
            if (imageUrl) {
                pages.push(`${serverUrl}/api/image/?url=${encodeURIComponent(imageUrl)}`)
            }
        }

        return App.createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: pages
        })
    }

    override async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const serverUrl = this.getServerUrl()
        const page = metadata?.page ?? 1
        const searchQuery = query.title ?? ''

        if (!searchQuery) {
            return App.createPagedResults({ results: [] })
        }

        const request = App.createRequest({
            url: `${serverUrl}/api/search?keyword=${encodeURIComponent(searchQuery)}&page=${page}`,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        const data = JSON.parse(response.data ?? '{}')

        const items: PartialSourceManga[] = []
        for (const item of data.data?.illusts ?? []) {
            items.push(App.createPartialSourceManga({
                mangaId: item.id,
                title: item.title,
                image: `${serverUrl}/api/image/?url=${encodeURIComponent(item.url || '')}`,
                subtitle: item.userName
            }))
        }

        return App.createPagedResults({
            results: items,
            metadata: { page: page + 1 }
        })
    }

    override async getTags(): Promise<TagSection[]> {
        return []
    }
}
