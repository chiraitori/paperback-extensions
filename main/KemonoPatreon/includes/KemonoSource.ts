import {
    Chapter,
    ChapterDetails,
    HomeSection,
    HomeSectionType,
    PagedResults,
    PartialSourceManga,
    Request,
    Response,
    SearchRequest,
    Source,
    SourceInterceptor,
    SourceManga,
    TagSection,
} from '@paperback/types'

const KEMONO_BASE_URL = 'https://kemono.cr'
const KEMONO_API_URL = `${KEMONO_BASE_URL}/api/v1`
const KEMONO_IMAGE_URL = 'https://img.kemono.cr'
const PAGE_SIZE = 50

interface KemonoFile {
    name?: string
    path?: string
    server?: string
}

interface KemonoPost {
    id: string
    user: string
    service: string
    title?: string
    content?: string
    substring?: string
    published?: string
    file?: KemonoFile
    attachments?: KemonoFile[]
}

interface KemonoPostResponse {
    post?: KemonoPost
    attachments?: KemonoFile[]
    previews?: KemonoFile[]
    videos?: KemonoFile[]
}

interface KemonoCreator {
    id: string
    name: string
    service: string
    updated?: string | number
    favorited?: number
}

interface KemonoDiscordChannel {
    id: string
    name?: string
}

interface KemonoDiscordEmbed {
    image?: { url?: string; proxy_url?: string }
    thumbnail?: { url?: string; proxy_url?: string }
}

interface KemonoDiscordMessage {
    attachments?: KemonoFile[]
    embeds?: KemonoDiscordEmbed[]
}

class KemonoInterceptor implements SourceInterceptor {
    async interceptResponse(response: Response): Promise<Response> {
        return response
    }

    async interceptRequest(request: Request): Promise<Request> {
        request.headers = {
            ...request.headers,
            Accept: 'text/css',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            Referer: KEMONO_BASE_URL,
        }
        return request
    }
}

export abstract class KemonoSource extends Source {
    abstract readonly service: string
    abstract readonly serviceName: string

    requestManager = App.createRequestManager({
        requestsPerSecond: 3,
        requestTimeout: 30000,
        interceptor: new KemonoInterceptor(),
    })

    override getMangaShareUrl(mangaId: string): string {
        const parts = mangaId.split('/')
        const userId = parts[0] === 'creator' ? parts[1] : parts[1]
        const creatorType = this.service === 'discord' ? 'server' : 'user'
        return `${KEMONO_BASE_URL}/${this.service}/${creatorType}/${userId}`
    }

    private creatorMangaId(creator: KemonoCreator): string {
        return `creator/${creator.id}/${encodeURIComponent(creator.name || creator.id)}`
    }

    private creatorIcon(userId: string): string {
        return `${KEMONO_IMAGE_URL}/icons/${this.service}/${userId}`
    }

    private isImage(file: KemonoFile): boolean {
        const filename = `${file.name || ''}${file.path || ''}`.toLowerCase()
        return /\.(avif|bmp|gif|jpe?g|png|webp)(?:$|\?)/.test(filename)
    }

    private isVideo(file: KemonoFile): boolean {
        const filename = `${file.name || ''}${file.path || ''}`.toLowerCase()
        return /\.(avi|m4v|mkv|mov|mp4|webm)(?:$|\?)/.test(filename)
    }

    private thumbnailUrl(path?: string): string {
        return path ? `${KEMONO_IMAGE_URL}/thumbnail/data${path}` : ''
    }

    private fileUrl(file: KemonoFile): string {
        if (!file.path) return ''
        if (/^https?:\/\//i.test(file.path)) return file.path
        const name = file.name ? `?f=${encodeURIComponent(file.name)}` : ''
        return `${KEMONO_BASE_URL}/data${file.path}${name}`
    }

    private cleanText(value?: string): string {
        if (!value) return 'No description'
        return value
            .replace(/<br\s*\/?\s*>/gi, '\n')
            .replace(/<[^>]*>/g, ' ')
            .replace(/&nbsp;/gi, ' ')
            .replace(/&amp;/gi, '&')
            .replace(/&lt;/gi, '<')
            .replace(/&gt;/gi, '>')
            .replace(/&#39;/g, "'")
            .replace(/&quot;/gi, '"')
            .replace(/[ \t]+/g, ' ')
            .replace(/\n\s+/g, '\n')
            .trim() || 'No description'
    }

    private async getJson(url: string): Promise<any> {
        let lastError: any
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                const request = App.createRequest({ url, method: 'GET' })
                const response = await this.requestManager.schedule(request, 1)
                return JSON.parse(response.data ?? 'null')
            } catch (error) {
                lastError = error
            }
        }
        throw lastError
    }

    private async getCreators(): Promise<KemonoCreator[]> {
        const data = await this.getJson(`${KEMONO_API_URL}/creators`)
        const creators: KemonoCreator[] = Array.isArray(data) ? data : (data?.artists ?? [])
        return creators.filter(creator => creator.service === this.service)
    }

    private async getCreatorPosts(userId: string): Promise<KemonoPost[]> {
        const posts: KemonoPost[] = []
        for (let offset = 0; offset < 200; offset += PAGE_SIZE) {
            const data = await this.getJson(`${KEMONO_API_URL}/${this.service}/user/${userId}/posts?o=${offset}`)
            const page: KemonoPost[] = Array.isArray(data) ? data : (data?.posts ?? [])
            posts.push(...page)
            if (page.length < PAGE_SIZE) break
        }
        return posts
    }

    private async getPost(userId: string, postId: string): Promise<KemonoPostResponse> {
        const data = await this.getJson(`${KEMONO_API_URL}/${this.service}/user/${userId}/post/${postId}`)
        const result: KemonoPostResponse = data?.post ? data : { post: data }
        if (!result.post?.id) throw new Error('Kemono returned an invalid post')
        return result
    }

    private postFiles(result: KemonoPostResponse): KemonoFile[] {
        const post = result.post!
        const files = [post.file, ...(post.attachments ?? []), ...(result.previews ?? []), ...(result.attachments ?? []), ...(result.videos ?? [])]
            .filter((file): file is KemonoFile => !!file?.path)
        const seen: { [path: string]: boolean } = {}
        return files.filter(file => {
            const path = file.path!
            if (seen[path]) return false
            seen[path] = true
            return true
        })
    }

    private creatorTile(creator: KemonoCreator): PartialSourceManga {
        return App.createPartialSourceManga({
            mangaId: this.creatorMangaId(creator),
            title: creator.name || creator.id,
            image: this.creatorIcon(creator.id),
            subtitle: `${creator.favorited ?? 0} favorites`,
        })
    }

    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const section = App.createHomeSection({
            id: 'recent-creators',
            title: `Recently Updated ${this.serviceName} Creators`,
            containsMoreItems: true,
            type: HomeSectionType.singleRowNormal,
        })
        sectionCallback(section)

        try {
            const creators = await this.getCreators()
            creators.sort((a, b) => Number(b.updated ?? 0) - Number(a.updated ?? 0))
            section.items = creators.slice(0, 20).map(creator => this.creatorTile(creator))
            sectionCallback(section)
        } catch (error) {
            console.log(`Kemono homepage error: ${error}`)
        }
    }

    override async getViewMoreItems(_homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const offset = Number(metadata?.offset ?? 20)
        const creators = await this.getCreators()
        creators.sort((a, b) => Number(b.updated ?? 0) - Number(a.updated ?? 0))
        const results = creators.slice(offset, offset + 20).map(creator => this.creatorTile(creator))
        const nextMetadata = offset + results.length < creators.length ? { offset: offset + results.length } : undefined
        return App.createPagedResults({ results, metadata: nextMetadata })
    }

    override async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const parts = mangaId.split('/')
        if (parts[0] === 'creator') {
            const userId = parts[1]!
            const name = decodeURIComponent(parts.slice(2).join('/') || userId)
            return App.createSourceManga({
                id: mangaId,
                mangaInfo: App.createMangaInfo({
                    titles: [name],
                    image: this.creatorIcon(userId),
                    author: name,
                    artist: name,
                    desc: `Archived ${this.serviceName} posts by ${name} on Kemono.`,
                    status: 'Ongoing',
                    tags: [],
                }),
            })
        }

        const userId = parts[1]!
        const postId = parts[2]!
        const result = await this.getPost(userId, postId)
        const post = result.post!
        const files = this.postFiles(result)
        const cover = files.find(file => this.isImage(file))
        const videoCount = files.filter(file => this.isVideo(file)).length
        const videoNote = videoCount ? `Contains ${videoCount} video attachment(s).\n\n` : ''

        return App.createSourceManga({
            id: mangaId,
            mangaInfo: App.createMangaInfo({
                titles: [post.title || 'Untitled'],
                image: cover ? this.thumbnailUrl(cover.path) : this.creatorIcon(userId),
                author: userId,
                artist: userId,
                desc: `${videoNote}${this.cleanText(post.content || post.substring)}`,
                status: 'Completed',
                tags: [],
            }),
        })
    }

    override async getChapters(mangaId: string): Promise<Chapter[]> {
        const parts = mangaId.split('/')
        if (parts[0] === 'creator') {
            if (this.service === 'discord') {
                const server = await this.getJson(`${KEMONO_API_URL}/discord/server/${parts[1]}`)
                const channels: KemonoDiscordChannel[] = server?.channels ?? []
                return channels.map((channel, index) => App.createChapter({
                    id: `channel/${channel.id}`,
                    name: channel.name || `Channel ${channel.id}`,
                    chapNum: channels.length - index,
                    langCode: 'en',
                }))
            }

            const posts = await this.getCreatorPosts(parts[1]!)
            return posts.map((post, index) => App.createChapter({
                id: `post/${post.id}`,
                name: post.title || `Post ${post.id}`,
                chapNum: posts.length - index,
                langCode: 'en',
            }))
        }

        return [App.createChapter({
            id: `post/${parts[2]}`,
            name: 'Images',
            chapNum: 1,
            langCode: 'en',
        })]
    }

    override async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const mangaParts = mangaId.split('/')
        const userId = mangaParts[1]!

        if (this.service === 'discord' && chapterId.startsWith('channel/')) {
            const channelId = chapterId.split('/')[1]!
            const messages: KemonoDiscordMessage[] = await this.getJson(`${KEMONO_API_URL}/discord/channel/${channelId}?o=0`)
            const pages: string[] = []
            for (const message of messages) {
                for (const file of message.attachments ?? []) {
                    if (this.isImage(file)) pages.push(this.fileUrl(file))
                }
                for (const embed of message.embeds ?? []) {
                    const image = embed.image?.url || embed.image?.proxy_url || embed.thumbnail?.url || embed.thumbnail?.proxy_url
                    if (image) pages.push(image)
                }
            }
            const uniquePages = pages.filter((page, index) => pages.indexOf(page) === index)
            if (!uniquePages.length) uniquePages.push(this.creatorIcon(userId))
            return App.createChapterDetails({ id: chapterId, mangaId, pages: uniquePages })
        }

        const postId = chapterId.split('/')[1] || mangaParts[2]!
        const result = await this.getPost(userId, postId)
        const imageFiles = this.postFiles(result).filter(file => this.isImage(file))
        const pages = imageFiles.map(file => this.fileUrl(file)).filter(Boolean)

        if (!pages.length) pages.push(this.creatorIcon(userId))
        return App.createChapterDetails({ id: chapterId, mangaId, pages })
    }

    override async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const searchQuery = (query.title ?? '').trim().toLowerCase()
        if (!searchQuery) return App.createPagedResults({ results: [] })

        const offset = Number(metadata?.offset ?? 0)
        const creators = (await this.getCreators())
            .filter(creator => creator.id.toLowerCase().includes(searchQuery) || creator.name.toLowerCase().includes(searchQuery))
            .sort((a, b) => Number(b.favorited ?? 0) - Number(a.favorited ?? 0))
        const results = creators.slice(offset, offset + 20).map(creator => this.creatorTile(creator))
        const nextMetadata = offset + results.length < creators.length ? { offset: offset + results.length } : undefined
        return App.createPagedResults({ results, metadata: nextMetadata })
    }

    override async getTags(): Promise<TagSection[]> {
        return []
    }

    override async supportsTagExclusion(): Promise<boolean> {
        return false
    }
}
