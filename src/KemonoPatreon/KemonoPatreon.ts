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

const KEMONO_BASE_URL = 'https://kemono.cr'
const KEMONO_API_URL = 'https://image.chiraitori.io.vn/api/kemono'
const SERVICE = 'patreon'
const SERVICE_NAME = 'Patreon'

interface KemonoPost {
    id: string
    user: string
    service: string
    title: string
    content: string
    embed: any
    shared_file: boolean
    added: string
    published: string
    edited: string
    file: { name: string; path: string }
    attachments: Array<{ name: string; path: string }>
}

interface KemonoCreator {
    id: string
    name: string
    service: string
    indexed: string
    updated: string
    favorited: number
}

export const KemonoPatreonInfo: SourceInfo = {
    version: '1.0.0',
    name: `Kemono ${SERVICE_NAME}`,
    icon: 'icon.png',
    author: 'chiraitori',
    authorWebsite: 'https://github.com/chiraitori/image-api',
    description: `Browse ${SERVICE_NAME} content archived on Kemono`,
    contentRating: ContentRating.ADULT,
    websiteBaseURL: `${KEMONO_BASE_URL}/${SERVICE}`,
    sourceTags: [
        { text: '18+', type: BadgeColor.YELLOW },
        { text: 'Kemono', type: BadgeColor.BLUE },
    ],
    intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.HOMEPAGE_SECTIONS
}

class KemonoInterceptor implements SourceInterceptor {
    async interceptResponse(response: Response): Promise<Response> { return response }
    async interceptRequest(request: Request): Promise<Request> { request.headers = { ...request.headers, 'Accept': 'text/css', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Referer': KEMONO_BASE_URL }; return request }
}

export class KemonoPatreon extends Source {
    requestManager = App.createRequestManager({
        requestsPerSecond: 3,
        requestTimeout: 30000,
        interceptor: new KemonoInterceptor()
    })

    override getMangaShareUrl(mangaId: string): string {
        const [userId] = mangaId.split('/')
        return `${KEMONO_BASE_URL}/${SERVICE}/user/${userId}`
    }

    isImage(filename: string): boolean {
        const ext = filename.toLowerCase().split('.').pop() || ''
        return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)
    }

    isVideo(filename: string): boolean {
        const ext = filename.toLowerCase().split('.').pop() || ''
        return ['mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v'].includes(ext)
    }

    getFileUrl(path: string): string {
        if (path.startsWith('http')) return path
        // Use proxy to bypass Kemono CDN DDoS protection
        return `${KEMONO_API_URL}/proxy?path=${encodeURIComponent(path)}`
    }

    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const section = App.createHomeSection({
            id: 'recent',
            title: `Recent ${SERVICE_NAME} Posts`,
            containsMoreItems: true,
            type: HomeSectionType.singleRowNormal
        })
        sectionCallback(section)

        try {
            const request = App.createRequest({
                url: `${KEMONO_API_URL}/${SERVICE}/posts`,
                method: 'GET'
            })
            const response = await this.requestManager.schedule(request, 1)
            const jsonData = JSON.parse(response.data ?? '{}'); const posts: KemonoPost[] = jsonData.posts ?? jsonData ?? []

            const items: PartialSourceManga[] = posts.slice(0, 20).map(post => {
                let thumbnail = ''
                if (post.file?.path && this.isImage(post.file.name)) {
                    thumbnail = this.getFileUrl(post.file.path)
                } else {
                    const imgAtt = (post.attachments || []).find(att => this.isImage(att.name))
                    if (imgAtt) thumbnail = this.getFileUrl(imgAtt.path)
                }
                return App.createPartialSourceManga({
                    mangaId: `${post.user}/${post.id}`,
                    title: post.title || 'Untitled',
                    image: thumbnail || `${KEMONO_BASE_URL}/static/kemono-logo.svg`,
                    subtitle: new Date(post.published).toLocaleDateString()
                })
            })

            section.items = items
            sectionCallback(section)
        } catch (error) {
            console.log(`Error: ${error}`)
        }
    }

    override async getViewMoreItems(_homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const offset = metadata?.offset ?? 0
        const request = App.createRequest({
            url: `${KEMONO_API_URL}/${SERVICE}/posts?o=${offset}`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(request, 1)
        const jsonData = JSON.parse(response.data ?? '{}'); const posts: KemonoPost[] = jsonData.posts ?? jsonData ?? []

        const items: PartialSourceManga[] = posts.map(post => {
            let thumbnail = ''
            if (post.file?.path && this.isImage(post.file.name)) {
                thumbnail = this.getFileUrl(post.file.path)
            } else {
                const imgAtt = (post.attachments || []).find(att => this.isImage(att.name))
                if (imgAtt) thumbnail = this.getFileUrl(imgAtt.path)
            }
            return App.createPartialSourceManga({
                mangaId: `${post.user}/${post.id}`,
                title: post.title || 'Untitled',
                image: thumbnail || `${KEMONO_BASE_URL}/static/kemono-logo.svg`,
                subtitle: new Date(post.published).toLocaleDateString()
            })
        })

        return App.createPagedResults({ results: items, metadata: { offset: offset + 50 } })
    }

    override async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const [userId, postId] = mangaId.split('/')
        const request = App.createRequest({
            url: `${KEMONO_API_URL}/${SERVICE}/user/${userId}/post/${postId}`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(request, 1)
        const post: KemonoPost = JSON.parse(response.data ?? '{}')

        const allFiles = [post.file, ...(post.attachments || [])].filter(f => f?.path)
        const videoCount = allFiles.filter(f => this.isVideo(f.name)).length
        let description = post.content || 'No description'
        if (videoCount > 0) description = `🎬 Contains ${videoCount} video(s)\n\n${description}`

        const coverFile = allFiles.find(f => this.isImage(f.name))
        return App.createSourceManga({
            id: mangaId,
            mangaInfo: App.createMangaInfo({
                titles: [post.title || 'Untitled'],
                image: coverFile ? this.getFileUrl(coverFile.path) : `${KEMONO_BASE_URL}/static/kemono-logo.svg`,
                author: userId,
                artist: userId,
                desc: description,
                status: 'Completed',
                tags: []
            })
        })
    }

    override async getChapters(mangaId: string): Promise<Chapter[]> {
        const [userId, postId] = mangaId.split('/')
        const chapters: Chapter[] = [
            App.createChapter({ id: `${postId}/images`, name: 'Images', chapNum: 1, langCode: 'en' })
        ]

        try {
            const request = App.createRequest({
                url: `${KEMONO_API_URL}/${SERVICE}/user/${userId}/post/${postId}`,
                method: 'GET'
            })
            const response = await this.requestManager.schedule(request, 1)
            const post: KemonoPost = JSON.parse(response.data ?? '{}')
            const allFiles = [post.file, ...(post.attachments || [])].filter(f => f?.path)

            let videoNum = 2
            for (const file of allFiles) {
                if (this.isVideo(file.name)) {
                    chapters.push(App.createChapter({
                        id: `${postId}/video/${file.path}`,
                        name: `🎬 ${file.name}`,
                        chapNum: videoNum++,
                        langCode: 'en'
                    }))
                }
            }
        } catch (e) { console.log(`Error: ${e}`) }

        return chapters
    }

    override async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const [userId, postId] = mangaId.split('/')

        if (chapterId.includes('/video/')) {
            const videoPath = chapterId.split('/video/')[1]
            return App.createChapterDetails({
                id: chapterId,
                mangaId: mangaId,
                pages: [this.getFileUrl(videoPath!)]
            })
        }

        const request = App.createRequest({
            url: `${KEMONO_API_URL}/${SERVICE}/user/${userId}/post/${postId}`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(request, 1)
        const post: KemonoPost = JSON.parse(response.data ?? '{}')

        const allFiles = [post.file, ...(post.attachments || [])].filter(f => f?.path)
        const pages = allFiles.filter(f => this.isImage(f.name)).map(f => this.getFileUrl(f.path))

        return App.createChapterDetails({ id: chapterId, mangaId: mangaId, pages: pages })
    }

    override async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const offset = metadata?.offset ?? 0
        const searchQuery = query.title ?? ''
        if (!searchQuery) return App.createPagedResults({ results: [] })

        try {
            const request = App.createRequest({ url: `${KEMONO_API_URL}/creators`, method: 'GET' })
            const response = await this.requestManager.schedule(request, 1)
            const creators: KemonoCreator[] = JSON.parse(response.data ?? '[]')

            const filtered = creators.filter(c =>
                c.service === SERVICE && c.name.toLowerCase().includes(searchQuery.toLowerCase())
            ).slice(offset, offset + 20)

            const items: PartialSourceManga[] = filtered.map(creator =>
                App.createPartialSourceManga({
                    mangaId: `${creator.id}/creator`,
                    title: creator.name,
                    image: `${KEMONO_BASE_URL}/static/kemono-logo.svg`,
                    subtitle: `${creator.favorited} favorites`
                })
            )
            return App.createPagedResults({ results: items, metadata: { offset: offset + 20 } })
        } catch (e) {
            return App.createPagedResults({ results: [] })
        }
    }

    override async getTags(): Promise<TagSection[]> { return [] }
    override async supportsTagExclusion(): Promise<boolean> { return false }
}
