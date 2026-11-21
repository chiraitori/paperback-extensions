import {
    BadgeColor,
    Chapter,
    ChapterDetails,
    ContentRating,
    DUISection,
    HomeSection,
    HomeSectionType,
    PagedResults,
    PartialSourceManga,
    Request,
    Response,
    SearchRequest,
    Source,
    SourceInfo,
    SourceIntents,
    SourceInterceptor,
    SourceManga,
    Tag,
    TagSection,
} from '@paperback/types'
import {
    decodeScrambleKey,
    decryptOpenSslAes,
} from './YuriGardenCrypto'

const SITE_URL = 'https://yurigarden.moe'
const API_URL = 'https://api.yurigarden.moe'
const CDN_URL = 'https://cdn.yurigarden.moe/storage/v1/object/public/yuri-garden-store/'
const APP_ORIGIN = 'https://yurigarden.com'
const FIREBASE_API_KEY = 'AIzaSyCB2wwL5MiTQMxXboaIDYQLw97APor_B0U'
const PAGE_LIMIT = 24
const TOKEN_REFRESH_MARGIN_MS = 60 * 1000
const MANGA_TOKEN_TTL_CAP_MS = 30 * 60 * 1000
const DEFAULT_USER_AGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

const KEY_EMAIL = 'yg_email'
const KEY_PASSWORD = 'yg_password'
const KEY_ACCESS_TOKEN = 'yg_access_token'
const KEY_REFRESH_TOKEN = 'yg_refresh_token'
const KEY_TOKEN_EXPIRES_AT = 'yg_token_expires_at'
const KEY_AUTH_STATUS = 'yg_auth_status'
const KEY_ENABLE_R18 = 'yg_enable_r18'
const KEY_PROXY_URL = 'yg_proxy_url'

interface SearchMetadata {
    page?: number
}

interface ComicSummary {
    id: string | number
    title: string
    thumbnail?: string
    r18?: boolean
    status?: string
    updatedAt?: number
}

interface ComicsListResponse {
    comics?: ComicSummary[]
    totalPages?: number
}

interface NamedEntity {
    id?: number
    name?: string
}

interface ComicDetailResponse {
    id: string | number
    title: string
    anotherNames?: string[]
    thumbnail?: string
    r18?: boolean
    status?: string
    description?: string
    genres?: string[]
    authors?: NamedEntity[]
    artists?: NamedEntity[]
}

interface ChapterItem {
    id: string | number
    order: number
    name?: string
    hideOrder?: boolean
    volume?: number | null
    publishedAt?: number
    lastUpdated?: number
    team?: NamedEntity
}

interface ChapterPageItem {
    id: string
    url?: string
    key?: string
}

interface ChapterPagesPayload {
    encrypted?: boolean
    data?: string
    isLocked?: boolean
    pages?: ChapterPageItem[]
}

interface GenreEntry {
    name: string
    slug: string
}

interface SystemsResponse {
    genres?: Record<string, GenreEntry>
}

interface FirebaseSignInResponse {
    idToken?: string
    refreshToken?: string
    expiresIn?: string
    email?: string
    displayName?: string
    error?: {
        message?: string
    }
}

interface FirebaseRefreshResponse {
    id_token?: string
    refresh_token?: string
    expires_in?: string
    error?: {
        message?: string
    }
}

interface YuriAuthResponse {
    accessToken?: string
    email?: string
    name?: string
    message?: string
}

const resolveMediaUrl = (path?: string): string => {
    if (!path) return ''
    const trimmed = path.trim()
    if (!trimmed) return ''
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed
    }
    return `${CDN_URL}${trimmed.replace(/^\/+/, '')}`
}

const mapComicStatus = (status?: string): string => {
    switch ((status ?? '').toLowerCase()) {
        case 'completed':
            return 'Completed'
        case 'hiatus':
            return 'Hiatus'
        case 'cancelled':
            return 'Cancelled'
        case 'ongoing':
        case 'oncoming':
        default:
            return 'Ongoing'
    }
}

const formatChapterName = (ch: ChapterItem): string => {
    if (ch.order === -1) {
        return ch.name ? `Oneshot - ${ch.name}` : 'Oneshot'
    }
    return ch.name ?? ''
}

export const YuriGardenInfo: SourceInfo = {
    version: '1.0.0',
    name: 'YuriGarden',
    icon: 'icon.png',
    author: 'chiraitori',
    authorWebsite: 'https://github.com/chiraitori/paperback-extensions',
    description: 'Read manga from YuriGarden with account login, optional R18 toggle, and unscrambler proxy support.',
    contentRating: ContentRating.ADULT,
    websiteBaseURL: SITE_URL,
    language: 'vi',
    sourceTags: [
        {
            text: '18+',
            type: BadgeColor.YELLOW,
        },
        {
            text: 'Vietnamese',
            type: BadgeColor.BLUE,
        },
    ],
    intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.HOMEPAGE_SECTIONS | SourceIntents.SETTINGS_UI,
}

export class YuriGardenInterceptor implements SourceInterceptor {
    async interceptRequest(request: Request): Promise<Request> {
        const headers: Record<string, string> = {
            ...(request.headers ?? {}),
        }

        const isYuriDomain =
            request.url.startsWith(SITE_URL) ||
            request.url.startsWith(API_URL) ||
            request.url.startsWith('https://cdn.yurigarden.moe')

        if (isYuriDomain) {
            headers['User-Agent'] = headers['User-Agent'] ?? DEFAULT_USER_AGENT
            headers['Referer'] = headers['Referer'] ?? `${SITE_URL}/`
            headers['Origin'] = headers['Origin'] ?? SITE_URL
        }

        if (request.url.startsWith(API_URL)) {
            headers['x-app-origin'] = APP_ORIGIN
            headers['x-custom-lang'] = 'vi'
        }

        request.headers = headers
        return request
    }

    async interceptResponse(response: Response): Promise<Response> {
        return response
    }
}

export class YuriGarden extends Source {
    stateManager = App.createSourceStateManager()

    requestManager = App.createRequestManager({
        requestsPerSecond: 6,
        requestTimeout: 30000,
        interceptor: new YuriGardenInterceptor(),
    })

    private mangaTokenCache?: {
        token: string
        expiresAtMs: number
    }

    override getMangaShareUrl(mangaId: string): string {
        return `${SITE_URL}/comic/${mangaId}`
    }

    override async supportsTagExclusion(): Promise<boolean> {
        return true
    }

    private async isLoggedIn(): Promise<boolean> {
        const accessToken = await this.stateManager.keychain.retrieve(KEY_ACCESS_TOKEN)
        const refreshToken = await this.stateManager.keychain.retrieve(KEY_REFRESH_TOKEN)
        return Boolean(accessToken || refreshToken)
    }

    private async isR18Enabled(): Promise<boolean> {
        if (!(await this.isLoggedIn())) {
            return false
        }
        return Boolean(await this.stateManager.retrieve(KEY_ENABLE_R18))
    }

    private async exchangeFirebaseToken(
        email: string,
        name: string,
        idToken: string,
        refreshToken: string,
        expiresInSec: number,
    ): Promise<string> {
        const request = App.createRequest({
            url: `${API_URL}/api/users/auth`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify({
                email,
                name,
                avatar: '',
                token: idToken,
            }),
        })

        const response = await this.requestManager.schedule(request, 1)
        const parsed = JSON.parse(response.data ?? '{}') as YuriAuthResponse
        if (!parsed.accessToken) {
            throw new Error(parsed.message ?? 'Failed to exchange YuriGarden access token')
        }

        const expiresAt = Date.now() + Math.max(expiresInSec, 60) * 1000
        await this.stateManager.keychain.store(KEY_ACCESS_TOKEN, parsed.accessToken)
        if (refreshToken) {
            await this.stateManager.keychain.store(KEY_REFRESH_TOKEN, refreshToken)
        }
        await this.stateManager.store(KEY_EMAIL, email)
        await this.stateManager.store(KEY_TOKEN_EXPIRES_AT, expiresAt)
        await this.stateManager.store(KEY_AUTH_STATUS, `Logged in: ${email}`)
        return parsed.accessToken
    }

    private async signIn(emailInput?: string, passwordInput?: string): Promise<string> {
        const storedEmail = String((await this.stateManager.retrieve(KEY_EMAIL)) ?? '').trim()
        const storedPassword = String((await this.stateManager.keychain.retrieve(KEY_PASSWORD)) ?? '')
        const email = (emailInput ?? storedEmail).trim()
        const password = passwordInput ?? storedPassword

        if (!email || !password) {
            throw new Error('Email and password are required to sign in')
        }

        const fbReq = App.createRequest({
            url: `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify({
                email,
                password,
                returnSecureToken: true,
            }),
        })

        const fbRes = await this.requestManager.schedule(fbReq, 1)
        const fbData = JSON.parse(fbRes.data ?? '{}') as FirebaseSignInResponse
        if (fbData.error || !fbData.idToken) {
            const msg = fbData.error?.message ?? 'Firebase authentication failed'
            await this.stateManager.store(KEY_AUTH_STATUS, `Login failed: ${msg}`)
            throw new Error(`Login failed: ${msg}`)
        }

        await this.stateManager.keychain.store(KEY_PASSWORD, password)
        return this.exchangeFirebaseToken(
            fbData.email ?? email,
            fbData.displayName ?? '',
            fbData.idToken,
            fbData.refreshToken ?? '',
            Number(fbData.expiresIn ?? 3600),
        )
    }

    private async signOut(): Promise<void> {
        await this.stateManager.keychain.store(KEY_ACCESS_TOKEN, '')
        await this.stateManager.keychain.store(KEY_REFRESH_TOKEN, '')
        await this.stateManager.keychain.store(KEY_PASSWORD, '')
        await this.stateManager.store(KEY_EMAIL, '')
        await this.stateManager.store(KEY_TOKEN_EXPIRES_AT, 0)
        await this.stateManager.store(KEY_ENABLE_R18, false)
        await this.stateManager.store(KEY_AUTH_STATUS, 'Not logged in')
    }

    private async refreshAuthToken(): Promise<string | undefined> {
        const refreshToken = String((await this.stateManager.keychain.retrieve(KEY_REFRESH_TOKEN)) ?? '')
        if (!refreshToken) {
            return undefined
        }

        const req = App.createRequest({
            url: `https://securetoken.googleapis.com/v1/token?key=${FIREBASE_API_KEY}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}`,
        })

        const res = await this.requestManager.schedule(req, 1)
        const parsed = JSON.parse(res.data ?? '{}') as FirebaseRefreshResponse
        if (parsed.error || !parsed.id_token) {
            return undefined
        }

        const email = String((await this.stateManager.retrieve(KEY_EMAIL)) ?? '')
        return this.exchangeFirebaseToken(
            email,
            '',
            parsed.id_token,
            parsed.refresh_token ?? refreshToken,
            Number(parsed.expires_in ?? 3600),
        )
    }

    private async getAuthToken(forceRefresh = false): Promise<string> {
        const accessToken = String((await this.stateManager.keychain.retrieve(KEY_ACCESS_TOKEN)) ?? '')
        const expiresAt = Number((await this.stateManager.retrieve(KEY_TOKEN_EXPIRES_AT)) ?? 0)

        if (accessToken && !forceRefresh && (!expiresAt || Date.now() < expiresAt - TOKEN_REFRESH_MARGIN_MS)) {
            return accessToken
        }

        const refreshed = await this.refreshAuthToken()
        if (refreshed) {
            return refreshed
        }

        const storedEmail = String((await this.stateManager.retrieve(KEY_EMAIL)) ?? '').trim()
        const storedPassword = String((await this.stateManager.keychain.retrieve(KEY_PASSWORD)) ?? '')
        if (storedEmail && storedPassword) {
            return this.signIn(storedEmail, storedPassword)
        }

        throw new Error('Please sign in via YuriGarden extension settings first.')
    }

    private async apiGet<T>(path: string, extraHeaders?: Record<string, string>): Promise<T> {
        let token = await this.getAuthToken(false)
        const makeRequest = (bearer: string): Request => App.createRequest({
            url: `${API_URL}${path}`,
            method: 'GET',
            headers: {
                Authorization: `Bearer ${bearer}`,
                ...(extraHeaders ?? {}),
            },
        })

        let response = await this.requestManager.schedule(makeRequest(token), 1)
        if (response.status === 401) {
            token = await this.getAuthToken(true)
            response = await this.requestManager.schedule(makeRequest(token), 1)
        }

        if (response.status >= 400) {
            throw new Error(`YuriGarden API error (${response.status}) on ${path}`)
        }

        return JSON.parse(response.data ?? '{}') as T
    }

    private async getMangaToken(comicId: string, chapterId: string, forceRefresh = false): Promise<string> {
        if (!forceRefresh && this.mangaTokenCache && Date.now() < this.mangaTokenCache.expiresAtMs - TOKEN_REFRESH_MARGIN_MS) {
            return this.mangaTokenCache.token
        }

        const request = App.createRequest({
            url: `${SITE_URL}/comic/${comicId}/${chapterId}`,
            method: 'GET',
        })
        const response = await this.requestManager.schedule(request, 1)
        const html = response.data ?? ''

        const match = /mangaToken\s*:(?:\s*\$R\[\d+\]\s*=)?\s*\{[^}]*token\s*:\s*["']([^"']+)["'](?:[^}]*expiresAt\s*:\s*["']([^"']+)["'])?/i.exec(html)
        const token = match?.[1]
        if (!token) {
            throw new Error('Failed to extract chapter decryption token from YuriGarden')
        }

        const parsedExpiry = match?.[2] ? Date.parse(match[2]) : NaN
        const defaultExpiry = Date.now() + 10 * 60 * 1000
        const expiresAtMs = !isNaN(parsedExpiry) && parsedExpiry > Date.now()
            ? Math.min(parsedExpiry, Date.now() + MANGA_TOKEN_TTL_CAP_MS)
            : defaultExpiry

        this.mangaTokenCache = {
            token,
            expiresAtMs,
        }
        return token
    }

    private mapComicSummary(comic: ComicSummary): PartialSourceManga {
        return App.createPartialSourceManga({
            mangaId: String(comic.id),
            title: comic.title,
            image: resolveMediaUrl(comic.thumbnail),
            subtitle: comic.r18 ? '18+' : undefined,
        })
    }

    override async getSourceMenu(): Promise<DUISection> {
        return App.createDUISection({
            id: 'yurigarden_settings',
            header: 'YuriGarden Settings',
            footer: 'Sign in with a YuriGarden email/password account. R18 can only be enabled while logged in. Set an Unscrambler Proxy URL to descramble chapter images.',
            isHidden: false,
            rows: async () => {
                const loggedIn = await this.isLoggedIn()
                const storedEmail = String((await this.stateManager.retrieve(KEY_EMAIL)) ?? '')
                const storedStatus = String((await this.stateManager.retrieve(KEY_AUTH_STATUS)) ?? '')
                const accountStatus = storedStatus || (loggedIn && storedEmail ? `Logged in: ${storedEmail}` : 'Not logged in')

                return [
                    App.createDUILabel({
                        id: 'account_status',
                        label: 'Account Status',
                        value: accountStatus,
                    }),
                    App.createDUIInputField({
                        id: 'email',
                        label: 'Email',
                        value: App.createDUIBinding({
                            get: async () => String((await this.stateManager.retrieve(KEY_EMAIL)) ?? ''),
                            set: async (newValue) => {
                                await this.stateManager.store(KEY_EMAIL, String(newValue ?? '').trim())
                            },
                        }),
                    }),
                    App.createDUISecureInputField({
                        id: 'password',
                        label: 'Password',
                        value: App.createDUIBinding({
                            get: async () => String((await this.stateManager.keychain.retrieve(KEY_PASSWORD)) ?? ''),
                            set: async (newValue) => {
                                await this.stateManager.keychain.store(KEY_PASSWORD, String(newValue ?? ''))
                            },
                        }),
                    }),
                    App.createDUIButton({
                        id: 'sign_in',
                        label: 'Sign In',
                        onTap: async () => {
                            await this.signIn()
                        },
                    }),
                    App.createDUIButton({
                        id: 'sign_out',
                        label: 'Sign Out',
                        onTap: async () => {
                            await this.signOut()
                        },
                    }),
                    App.createDUISwitch({
                        id: 'enable_r18',
                        label: 'Enable R18 (Login Required)',
                        value: App.createDUIBinding({
                            get: async () => await this.isR18Enabled(),
                            set: async (newValue) => {
                                const wantsR18 = Boolean(newValue)
                                if (wantsR18 && !(await this.isLoggedIn())) {
                                    await this.stateManager.store(KEY_ENABLE_R18, false)
                                    await this.stateManager.store(KEY_AUTH_STATUS, 'Sign in required before enabling R18')
                                    return
                                }
                                await this.stateManager.store(KEY_ENABLE_R18, wantsR18)
                            },
                        }),
                    }),
                    App.createDUIInputField({
                        id: 'proxy_url',
                        label: 'Unscrambler Proxy URL',
                        value: App.createDUIBinding({
                            get: async () => String((await this.stateManager.retrieve(KEY_PROXY_URL)) ?? ''),
                            set: async (newValue) => {
                                const cleaned = String(newValue ?? '').trim().replace(/\/+$/, '')
                                await this.stateManager.store(KEY_PROXY_URL, cleaned)
                            },
                        }),
                    }),
                ]
            },
        })
    }

    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        await this.getAuthToken(false)
        const r18Enabled = await this.isR18Enabled()

        const sectionDefs: Array<{ id: string; title: string; containsMoreItems: boolean }> = [
            { id: 'latest', title: 'Mới cập nhật', containsMoreItems: true },
            { id: 'trending_day', title: 'Top ngày', containsMoreItems: false },
            { id: 'trending_week', title: 'Top tuần', containsMoreItems: false },
        ]

        if (r18Enabled) {
            sectionDefs.push(
                { id: 'trending_r18', title: 'Top R18', containsMoreItems: false },
                { id: 'latest_r18', title: 'R18 Mới', containsMoreItems: true },
            )
        }

        const sections = sectionDefs.map((def) => App.createHomeSection({
            id: def.id,
            title: def.title,
            containsMoreItems: def.containsMoreItems,
            type: HomeSectionType.singleRowNormal,
        }))

        for (const section of sections) {
            sectionCallback(section)
        }

        for (const section of sections) {
            let comics: ComicSummary[] = []
            if (section.id === 'latest') {
                const res = await this.apiGet<ComicsListResponse>(`/api/comics?page=1&limit=${PAGE_LIMIT}&allowR18=${r18Enabled}`)
                comics = res.comics ?? []
            } else if (section.id === 'trending_day') {
                comics = await this.apiGet<ComicSummary[]>('/api/comics/rank/trending?viewType=day&trendingType=view&r18=false')
            } else if (section.id === 'trending_week') {
                comics = await this.apiGet<ComicSummary[]>('/api/comics/rank/trending?viewType=week&trendingType=view&r18=false')
            } else if (section.id === 'trending_r18') {
                comics = await this.apiGet<ComicSummary[]>('/api/comics/rank/trending?viewType=week&trendingType=view&r18=true')
            } else if (section.id === 'latest_r18') {
                const res = await this.apiGet<ComicsListResponse>(`/api/comics?page=1&limit=${PAGE_LIMIT}&r18=true`)
                comics = res.comics ?? []
            }

            section.items = comics.map((comic) => this.mapComicSummary(comic))
            sectionCallback(section)
        }
    }

    override async getViewMoreItems(homepageSectionId: string, metadata: SearchMetadata | undefined): Promise<PagedResults> {
        const page = metadata?.page ?? 1
        const r18Enabled = await this.isR18Enabled()

        let queryUrl = `/api/comics?page=${page}&limit=${PAGE_LIMIT}&allowR18=${r18Enabled}`
        if (homepageSectionId === 'latest_r18') {
            if (!r18Enabled) {
                return App.createPagedResults({ results: [] })
            }
            queryUrl = `/api/comics?page=${page}&limit=${PAGE_LIMIT}&r18=true`
        }

        const data = await this.apiGet<ComicsListResponse>(queryUrl)
        const items = (data.comics ?? []).map((comic) => this.mapComicSummary(comic))
        const totalPages = data.totalPages ?? 1

        return App.createPagedResults({
            results: items,
            metadata: page < totalPages ? { page: page + 1 } : undefined,
        })
    }

    override async getSearchTags(): Promise<TagSection[]> {
        const request = App.createRequest({
            url: `${API_URL}/resources/systems_vi.json`,
            method: 'GET',
        })
        const response = await this.requestManager.schedule(request, 1)
        const data = JSON.parse(response.data ?? '{}') as SystemsResponse

        const tags: Tag[] = Object.values(data.genres ?? {})
            .map((genre) => App.createTag({
                id: genre.slug,
                label: genre.name,
            }))
            .sort((a, b) => a.label.localeCompare(b.label))

        return [
            App.createTagSection({
                id: 'genres',
                label: 'Thể loại',
                tags,
            }),
        ]
    }

    override async getSearchResults(query: SearchRequest, metadata: SearchMetadata | undefined): Promise<PagedResults> {
        const page = metadata?.page ?? 1
        const r18Enabled = await this.isR18Enabled()

        const params: string[] = [
            `page=${page}`,
            `limit=${PAGE_LIMIT}`,
            `allowR18=${r18Enabled}`,
        ]

        const keyword = query.title?.trim()
        if (keyword) {
            params.push(`search=${encodeURIComponent(keyword)}`)
        }

        if (query.includedTags && query.includedTags.length > 0) {
            const genres = query.includedTags.map((tag) => tag.id).join(',')
            params.push(`genre=${encodeURIComponent(genres)}`)
        }

        if (query.excludedTags && query.excludedTags.length > 0) {
            const blocked = query.excludedTags.map((tag) => tag.id).join(',')
            params.push(`blockGenres=${encodeURIComponent(blocked)}`)
        }

        const data = await this.apiGet<ComicsListResponse>(`/api/comics?${params.join('&')}`)
        const items = (data.comics ?? []).map((comic) => this.mapComicSummary(comic))
        const totalPages = data.totalPages ?? 1

        return App.createPagedResults({
            results: items,
            metadata: page < totalPages ? { page: page + 1 } : undefined,
        })
    }

    override async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const comic = await this.apiGet<ComicDetailResponse>(`/api/comics/${mangaId}`)

        const titles = [comic.title, ...(comic.anotherNames ?? [])]
            .map((t) => t.trim())
            .filter(Boolean)

        const author = (comic.authors ?? [])
            .map((a) => a.name ?? '')
            .filter(Boolean)
            .join(', ')

        const artist = (comic.artists ?? [])
            .map((a) => a.name ?? '')
            .filter(Boolean)
            .join(', ')

        const genreTags: Tag[] = (comic.genres ?? []).map((slug) => App.createTag({
            id: slug,
            label: slug,
        }))

        return App.createSourceManga({
            id: mangaId,
            mangaInfo: App.createMangaInfo({
                titles: titles.length > 0 ? titles : [`Comic #${mangaId}`],
                image: resolveMediaUrl(comic.thumbnail),
                author: author || undefined,
                artist: artist || author || undefined,
                desc: comic.description?.trim() || 'Không có mô tả.',
                status: mapComicStatus(comic.status),
                hentai: Boolean(comic.r18),
                tags: genreTags.length > 0
                    ? [
                        App.createTagSection({
                            id: 'genres',
                            label: 'Thể loại',
                            tags: genreTags,
                        }),
                    ]
                    : [],
            }),
        })
    }

    override async getChapters(mangaId: string): Promise<Chapter[]> {
        const chapters = await this.apiGet<ChapterItem[]>(`/api/chapters/comic/${mangaId}`)
        return chapters.map((ch, idx) => {
            const timestamp = ch.publishedAt ?? ch.lastUpdated
            return App.createChapter({
                id: String(ch.id),
                chapNum: ch.order < 0 ? 0 : ch.order,
                volume: typeof ch.volume === 'number' ? ch.volume : undefined,
                name: formatChapterName(ch),
                group: ch.team?.name,
                time: timestamp ? new Date(timestamp) : undefined,
                langCode: 'vi',
                sortingIndex: chapters.length - idx,
            })
        })
    }

    private decryptChapterPayload(payload: ChapterPagesPayload, mangaToken: string): ChapterPagesPayload | null {
        if (!payload.encrypted) {
            return payload
        }
        if (typeof payload.data !== 'string' || !payload.data) {
            return null
        }
        try {
            const jsonText = decryptOpenSslAes(payload.data, mangaToken)
            return JSON.parse(jsonText) as ChapterPagesPayload
        } catch {
            return null
        }
    }

    override async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const rawPayload = await this.apiGet<ChapterPagesPayload>(`/api/chapters/pages/${chapterId}`)
        let resolved: ChapterPagesPayload | null = null

        if (!rawPayload.encrypted) {
            resolved = rawPayload
        } else {
            let mangaToken = await this.getMangaToken(mangaId, chapterId, false)
            resolved = this.decryptChapterPayload(rawPayload, mangaToken)

            if (!resolved) {
                const fallbackPayload = await this.apiGet<ChapterPagesPayload>(
                    `/api/chapters/pages/${chapterId}`,
                    { 'x-chapter-key-fallback': 'previous' },
                )
                resolved = this.decryptChapterPayload(fallbackPayload, mangaToken)
            }

            if (!resolved) {
                mangaToken = await this.getMangaToken(mangaId, chapterId, true)
                resolved = this.decryptChapterPayload(rawPayload, mangaToken)
            }
        }

        if (!resolved) {
            throw new Error('Failed to decrypt YuriGarden chapter pages')
        }

        if (resolved.isLocked && (!resolved.pages || resolved.pages.length === 0)) {
            throw new Error('This chapter requires a password on YuriGarden')
        }

        const proxyUrl = String((await this.stateManager.retrieve(KEY_PROXY_URL)) ?? '')
            .trim()
            .replace(/\/+$/, '')

        const pages: string[] = []
        for (const page of resolved.pages ?? []) {
            const cleanPath = (page.url ?? '').replace('_credit', '')
            const cdnUrl = resolveMediaUrl(cleanPath)
            if (!cdnUrl) {
                continue
            }

            if (proxyUrl && page.key) {
                // Validate key before delegating to proxy so malformed keys fail fast
                decodeScrambleKey(page.key)
                pages.push(`${proxyUrl}/unscramble?url=${encodeURIComponent(cdnUrl)}&key=${encodeURIComponent(page.key)}`)
            } else {
                pages.push(cdnUrl)
            }
        }

        return App.createChapterDetails({
            id: chapterId,
            mangaId,
            pages,
        })
    }
}
