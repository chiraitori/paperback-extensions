(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Sources = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadgeColor = void 0;
var BadgeColor;
(function (BadgeColor) {
    BadgeColor["BLUE"] = "default";
    BadgeColor["GREEN"] = "success";
    BadgeColor["GREY"] = "info";
    BadgeColor["YELLOW"] = "warning";
    BadgeColor["RED"] = "danger";
})(BadgeColor = exports.BadgeColor || (exports.BadgeColor = {}));

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeSectionType = void 0;
var HomeSectionType;
(function (HomeSectionType) {
    HomeSectionType["singleRowNormal"] = "singleRowNormal";
    HomeSectionType["singleRowLarge"] = "singleRowLarge";
    HomeSectionType["doubleRow"] = "doubleRow";
    HomeSectionType["featured"] = "featured";
})(HomeSectionType = exports.HomeSectionType || (exports.HomeSectionType = {}));

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],5:[function(require,module,exports){
"use strict";
/**
 * Request objects hold information for a particular source (see sources for example)
 * This allows us to to use a generic api to make the calls against any source
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlEncodeObject = exports.convertTime = exports.Source = void 0;
/**
* @deprecated Use {@link PaperbackExtensionBase}
*/
class Source {
    constructor(cheerio) {
        this.cheerio = cheerio;
    }
    /**
     * @deprecated use {@link Source.getSearchResults getSearchResults} instead
     */
    searchRequest(query, metadata) {
        return this.getSearchResults(query, metadata);
    }
    /**
     * @deprecated use {@link Source.getSearchTags} instead
     */
    async getTags() {
        // @ts-ignore
        return this.getSearchTags?.();
    }
}
exports.Source = Source;
// Many sites use '[x] time ago' - Figured it would be good to handle these cases in general
function convertTime(timeAgo) {
    let time;
    let trimmed = Number((/\d*/.exec(timeAgo) ?? [])[0]);
    trimmed = (trimmed == 0 && timeAgo.includes('a')) ? 1 : trimmed;
    if (timeAgo.includes('minutes')) {
        time = new Date(Date.now() - trimmed * 60000);
    }
    else if (timeAgo.includes('hours')) {
        time = new Date(Date.now() - trimmed * 3600000);
    }
    else if (timeAgo.includes('days')) {
        time = new Date(Date.now() - trimmed * 86400000);
    }
    else if (timeAgo.includes('year') || timeAgo.includes('years')) {
        time = new Date(Date.now() - trimmed * 31556952000);
    }
    else {
        time = new Date(Date.now());
    }
    return time;
}
exports.convertTime = convertTime;
/**
 * When a function requires a POST body, it always should be defined as a JsonObject
 * and then passed through this function to ensure that it's encoded properly.
 * @param obj
 */
function urlEncodeObject(obj) {
    let ret = {};
    for (const entry of Object.entries(obj)) {
        ret[encodeURIComponent(entry[0])] = encodeURIComponent(entry[1]);
    }
    return ret;
}
exports.urlEncodeObject = urlEncodeObject;

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentRating = exports.SourceIntents = void 0;
var SourceIntents;
(function (SourceIntents) {
    SourceIntents[SourceIntents["MANGA_CHAPTERS"] = 1] = "MANGA_CHAPTERS";
    SourceIntents[SourceIntents["MANGA_TRACKING"] = 2] = "MANGA_TRACKING";
    SourceIntents[SourceIntents["HOMEPAGE_SECTIONS"] = 4] = "HOMEPAGE_SECTIONS";
    SourceIntents[SourceIntents["COLLECTION_MANAGEMENT"] = 8] = "COLLECTION_MANAGEMENT";
    SourceIntents[SourceIntents["CLOUDFLARE_BYPASS_REQUIRED"] = 16] = "CLOUDFLARE_BYPASS_REQUIRED";
    SourceIntents[SourceIntents["SETTINGS_UI"] = 32] = "SETTINGS_UI";
})(SourceIntents = exports.SourceIntents || (exports.SourceIntents = {}));
/**
 * A content rating to be attributed to each source.
 */
var ContentRating;
(function (ContentRating) {
    ContentRating["EVERYONE"] = "EVERYONE";
    ContentRating["MATURE"] = "MATURE";
    ContentRating["ADULT"] = "ADULT";
})(ContentRating = exports.ContentRating || (exports.ContentRating = {}));

},{}],7:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./Source"), exports);
__exportStar(require("./ByteArray"), exports);
__exportStar(require("./Badge"), exports);
__exportStar(require("./interfaces"), exports);
__exportStar(require("./SourceInfo"), exports);
__exportStar(require("./HomeSectionType"), exports);
__exportStar(require("./PaperbackExtensionBase"), exports);

},{"./Badge":1,"./ByteArray":2,"./HomeSectionType":3,"./PaperbackExtensionBase":4,"./Source":5,"./SourceInfo":6,"./interfaces":15}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],15:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./ChapterProviding"), exports);
__exportStar(require("./CloudflareBypassRequestProviding"), exports);
__exportStar(require("./HomePageSectionsProviding"), exports);
__exportStar(require("./MangaProgressProviding"), exports);
__exportStar(require("./MangaProviding"), exports);
__exportStar(require("./RequestManagerProviding"), exports);
__exportStar(require("./SearchResultsProviding"), exports);

},{"./ChapterProviding":8,"./CloudflareBypassRequestProviding":9,"./HomePageSectionsProviding":10,"./MangaProgressProviding":11,"./MangaProviding":12,"./RequestManagerProviding":13,"./SearchResultsProviding":14}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],33:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],34:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],35:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],36:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],37:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],38:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],39:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],40:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],41:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],42:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],43:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],44:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],45:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],46:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],47:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],48:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],49:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],50:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],51:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],52:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],53:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],54:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],55:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],56:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],57:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],58:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],59:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],60:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./DynamicUI/Exports/DUIBinding"), exports);
__exportStar(require("./DynamicUI/Exports/DUIForm"), exports);
__exportStar(require("./DynamicUI/Exports/DUIFormRow"), exports);
__exportStar(require("./DynamicUI/Exports/DUISection"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIButton"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIHeader"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIInputField"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUILabel"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUILink"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIMultilineLabel"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUINavigationButton"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIOAuthButton"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUISecureInputField"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUISelect"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIStepper"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUISwitch"), exports);
__exportStar(require("./Exports/ChapterDetails"), exports);
__exportStar(require("./Exports/Chapter"), exports);
__exportStar(require("./Exports/Cookie"), exports);
__exportStar(require("./Exports/HomeSection"), exports);
__exportStar(require("./Exports/IconText"), exports);
__exportStar(require("./Exports/MangaInfo"), exports);
__exportStar(require("./Exports/MangaProgress"), exports);
__exportStar(require("./Exports/PartialSourceManga"), exports);
__exportStar(require("./Exports/MangaUpdates"), exports);
__exportStar(require("./Exports/PBCanvas"), exports);
__exportStar(require("./Exports/PBImage"), exports);
__exportStar(require("./Exports/PagedResults"), exports);
__exportStar(require("./Exports/RawData"), exports);
__exportStar(require("./Exports/Request"), exports);
__exportStar(require("./Exports/SourceInterceptor"), exports);
__exportStar(require("./Exports/RequestManager"), exports);
__exportStar(require("./Exports/Response"), exports);
__exportStar(require("./Exports/SearchField"), exports);
__exportStar(require("./Exports/SearchRequest"), exports);
__exportStar(require("./Exports/SourceCookieStore"), exports);
__exportStar(require("./Exports/SourceManga"), exports);
__exportStar(require("./Exports/SecureStateManager"), exports);
__exportStar(require("./Exports/SourceStateManager"), exports);
__exportStar(require("./Exports/Tag"), exports);
__exportStar(require("./Exports/TagSection"), exports);
__exportStar(require("./Exports/TrackedMangaChapterReadAction"), exports);
__exportStar(require("./Exports/TrackerActionQueue"), exports);

},{"./DynamicUI/Exports/DUIBinding":17,"./DynamicUI/Exports/DUIForm":18,"./DynamicUI/Exports/DUIFormRow":19,"./DynamicUI/Exports/DUISection":20,"./DynamicUI/Rows/Exports/DUIButton":21,"./DynamicUI/Rows/Exports/DUIHeader":22,"./DynamicUI/Rows/Exports/DUIInputField":23,"./DynamicUI/Rows/Exports/DUILabel":24,"./DynamicUI/Rows/Exports/DUILink":25,"./DynamicUI/Rows/Exports/DUIMultilineLabel":26,"./DynamicUI/Rows/Exports/DUINavigationButton":27,"./DynamicUI/Rows/Exports/DUIOAuthButton":28,"./DynamicUI/Rows/Exports/DUISecureInputField":29,"./DynamicUI/Rows/Exports/DUISelect":30,"./DynamicUI/Rows/Exports/DUIStepper":31,"./DynamicUI/Rows/Exports/DUISwitch":32,"./Exports/Chapter":33,"./Exports/ChapterDetails":34,"./Exports/Cookie":35,"./Exports/HomeSection":36,"./Exports/IconText":37,"./Exports/MangaInfo":38,"./Exports/MangaProgress":39,"./Exports/MangaUpdates":40,"./Exports/PBCanvas":41,"./Exports/PBImage":42,"./Exports/PagedResults":43,"./Exports/PartialSourceManga":44,"./Exports/RawData":45,"./Exports/Request":46,"./Exports/RequestManager":47,"./Exports/Response":48,"./Exports/SearchField":49,"./Exports/SearchRequest":50,"./Exports/SecureStateManager":51,"./Exports/SourceCookieStore":52,"./Exports/SourceInterceptor":53,"./Exports/SourceManga":54,"./Exports/SourceStateManager":55,"./Exports/Tag":56,"./Exports/TagSection":57,"./Exports/TrackedMangaChapterReadAction":58,"./Exports/TrackerActionQueue":59}],61:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./generated/_exports"), exports);
__exportStar(require("./base/index"), exports);
__exportStar(require("./compat/DyamicUI"), exports);

},{"./base/index":7,"./compat/DyamicUI":16,"./generated/_exports":60}],62:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YuriGarden = exports.YuriGardenInterceptor = exports.YuriGardenInfo = void 0;
const types_1 = require("@paperback/types");
const YuriGardenCrypto_1 = require("./YuriGardenCrypto");
const SITE_URL = 'https://yurigarden.moe';
const API_URL = 'https://api.yurigarden.moe';
const CDN_URL = 'https://cdn.yurigarden.moe/storage/v1/object/public/yuri-garden-store/';
const APP_ORIGIN = 'https://yurigarden.com';
const FIREBASE_API_KEY = 'AIzaSyCB2wwL5MiTQMxXboaIDYQLw97APor_B0U';
const PAGE_LIMIT = 24;
const TOKEN_REFRESH_MARGIN_MS = 60 * 1000;
const MANGA_TOKEN_TTL_CAP_MS = 30 * 60 * 1000;
const DEFAULT_PROXY_URL = 'https://ctx.haimiya.tech';
const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const KEY_EMAIL = 'yg_email';
const KEY_PASSWORD = 'yg_password';
const KEY_ACCESS_TOKEN = 'yg_access_token';
const KEY_REFRESH_TOKEN = 'yg_refresh_token';
const KEY_TOKEN_EXPIRES_AT = 'yg_token_expires_at';
const KEY_AUTH_STATUS = 'yg_auth_status';
const KEY_ENABLE_R18 = 'yg_enable_r18';
const KEY_PROXY_URL = 'yg_proxy_url';
const resolveMediaUrl = (path) => {
    if (!path)
        return '';
    const trimmed = path.trim();
    if (!trimmed)
        return '';
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed;
    }
    return `${CDN_URL}${trimmed.replace(/^\/+/, '')}`;
};
const mapComicStatus = (status) => {
    switch ((status ?? '').toLowerCase()) {
        case 'completed':
            return 'Completed';
        case 'hiatus':
            return 'Hiatus';
        case 'cancelled':
            return 'Cancelled';
        case 'ongoing':
        case 'oncoming':
        default:
            return 'Ongoing';
    }
};
const formatChapterName = (ch) => {
    if (ch.order === -1) {
        return ch.name ? `Oneshot - ${ch.name}` : 'Oneshot';
    }
    return ch.name ?? '';
};
exports.YuriGardenInfo = {
    version: '1.0.1',
    name: 'YuriGarden',
    icon: 'icon.png',
    author: 'chiraitori',
    authorWebsite: 'https://github.com/chiraitori/paperback-extensions',
    description: 'Read manga from YuriGarden with account login, optional R18 toggle, and unscrambler proxy support.',
    contentRating: types_1.ContentRating.ADULT,
    websiteBaseURL: SITE_URL,
    language: 'vi',
    sourceTags: [
        {
            text: '18+',
            type: types_1.BadgeColor.YELLOW,
        },
        {
            text: 'Vietnamese',
            type: types_1.BadgeColor.BLUE,
        },
    ],
    intents: types_1.SourceIntents.MANGA_CHAPTERS | types_1.SourceIntents.HOMEPAGE_SECTIONS | types_1.SourceIntents.SETTINGS_UI,
};
class YuriGardenInterceptor {
    async interceptRequest(request) {
        const headers = {
            ...(request.headers ?? {}),
        };
        const isYuriDomain = request.url.startsWith(SITE_URL) ||
            request.url.startsWith(API_URL) ||
            request.url.startsWith('https://cdn.yurigarden.moe');
        if (isYuriDomain) {
            headers['User-Agent'] = headers['User-Agent'] ?? DEFAULT_USER_AGENT;
            headers['Referer'] = headers['Referer'] ?? `${SITE_URL}/`;
            headers['Origin'] = headers['Origin'] ?? SITE_URL;
        }
        if (request.url.startsWith(API_URL)) {
            headers['x-app-origin'] = APP_ORIGIN;
            headers['x-custom-lang'] = 'vi';
        }
        request.headers = headers;
        return request;
    }
    async interceptResponse(response) {
        return response;
    }
}
exports.YuriGardenInterceptor = YuriGardenInterceptor;
class YuriGarden extends types_1.Source {
    constructor() {
        super(...arguments);
        this.stateManager = App.createSourceStateManager();
        this.requestManager = App.createRequestManager({
            requestsPerSecond: 6,
            requestTimeout: 30000,
            interceptor: new YuriGardenInterceptor(),
        });
    }
    getMangaShareUrl(mangaId) {
        return `${SITE_URL}/comic/${mangaId}`;
    }
    async supportsTagExclusion() {
        return true;
    }
    async isLoggedIn() {
        const accessToken = await this.stateManager.keychain.retrieve(KEY_ACCESS_TOKEN);
        const refreshToken = await this.stateManager.keychain.retrieve(KEY_REFRESH_TOKEN);
        return Boolean(accessToken || refreshToken);
    }
    async isR18Enabled() {
        if (!(await this.isLoggedIn())) {
            return false;
        }
        return Boolean(await this.stateManager.retrieve(KEY_ENABLE_R18));
    }
    async getProxyUrl() {
        const stored = await this.stateManager.retrieve(KEY_PROXY_URL);
        const cleaned = String(stored ?? '').trim().replace(/\/+$/, '');
        return cleaned || DEFAULT_PROXY_URL;
    }
    async exchangeFirebaseToken(email, name, idToken, refreshToken, expiresInSec) {
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
        });
        const response = await this.requestManager.schedule(request, 1);
        const parsed = JSON.parse(response.data ?? '{}');
        if (!parsed.accessToken) {
            throw new Error(parsed.message ?? 'Failed to exchange YuriGarden access token');
        }
        const expiresAt = Date.now() + Math.max(expiresInSec, 60) * 1000;
        await this.stateManager.keychain.store(KEY_ACCESS_TOKEN, parsed.accessToken);
        if (refreshToken) {
            await this.stateManager.keychain.store(KEY_REFRESH_TOKEN, refreshToken);
        }
        await this.stateManager.store(KEY_EMAIL, email);
        await this.stateManager.store(KEY_TOKEN_EXPIRES_AT, expiresAt);
        await this.stateManager.store(KEY_AUTH_STATUS, `Logged in: ${email}`);
        return parsed.accessToken;
    }
    async signIn(emailInput, passwordInput) {
        const storedEmail = String((await this.stateManager.retrieve(KEY_EMAIL)) ?? '').trim();
        const storedPassword = String((await this.stateManager.keychain.retrieve(KEY_PASSWORD)) ?? '');
        const email = (emailInput ?? storedEmail).trim();
        const password = passwordInput ?? storedPassword;
        if (!email || !password) {
            throw new Error('Email and password are required to sign in');
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
        });
        const fbRes = await this.requestManager.schedule(fbReq, 1);
        const fbData = JSON.parse(fbRes.data ?? '{}');
        if (fbData.error || !fbData.idToken) {
            const msg = fbData.error?.message ?? 'Firebase authentication failed';
            await this.stateManager.store(KEY_AUTH_STATUS, `Login failed: ${msg}`);
            throw new Error(`Login failed: ${msg}`);
        }
        await this.stateManager.keychain.store(KEY_PASSWORD, password);
        return this.exchangeFirebaseToken(fbData.email ?? email, fbData.displayName ?? '', fbData.idToken, fbData.refreshToken ?? '', Number(fbData.expiresIn ?? 3600));
    }
    async signOut() {
        await this.stateManager.keychain.store(KEY_ACCESS_TOKEN, '');
        await this.stateManager.keychain.store(KEY_REFRESH_TOKEN, '');
        await this.stateManager.keychain.store(KEY_PASSWORD, '');
        await this.stateManager.store(KEY_EMAIL, '');
        await this.stateManager.store(KEY_TOKEN_EXPIRES_AT, 0);
        await this.stateManager.store(KEY_ENABLE_R18, false);
        await this.stateManager.store(KEY_AUTH_STATUS, 'Not logged in');
    }
    async refreshAuthToken() {
        const refreshToken = String((await this.stateManager.keychain.retrieve(KEY_REFRESH_TOKEN)) ?? '');
        if (!refreshToken) {
            return undefined;
        }
        const req = App.createRequest({
            url: `https://securetoken.googleapis.com/v1/token?key=${FIREBASE_API_KEY}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}`,
        });
        const res = await this.requestManager.schedule(req, 1);
        const parsed = JSON.parse(res.data ?? '{}');
        if (parsed.error || !parsed.id_token) {
            return undefined;
        }
        const email = String((await this.stateManager.retrieve(KEY_EMAIL)) ?? '');
        return this.exchangeFirebaseToken(email, '', parsed.id_token, parsed.refresh_token ?? refreshToken, Number(parsed.expires_in ?? 3600));
    }
    async getAuthToken(forceRefresh = false) {
        const accessToken = String((await this.stateManager.keychain.retrieve(KEY_ACCESS_TOKEN)) ?? '');
        const expiresAt = Number((await this.stateManager.retrieve(KEY_TOKEN_EXPIRES_AT)) ?? 0);
        if (accessToken && !forceRefresh && (!expiresAt || Date.now() < expiresAt - TOKEN_REFRESH_MARGIN_MS)) {
            return accessToken;
        }
        const refreshed = await this.refreshAuthToken();
        if (refreshed) {
            return refreshed;
        }
        const storedEmail = String((await this.stateManager.retrieve(KEY_EMAIL)) ?? '').trim();
        const storedPassword = String((await this.stateManager.keychain.retrieve(KEY_PASSWORD)) ?? '');
        if (storedEmail && storedPassword) {
            return this.signIn(storedEmail, storedPassword);
        }
        throw new Error('Please sign in via YuriGarden extension settings first.');
    }
    async apiGet(path, extraHeaders) {
        let token = await this.getAuthToken(false);
        const makeRequest = (bearer) => App.createRequest({
            url: `${API_URL}${path}`,
            method: 'GET',
            headers: {
                Authorization: `Bearer ${bearer}`,
                ...(extraHeaders ?? {}),
            },
        });
        let response = await this.requestManager.schedule(makeRequest(token), 1);
        if (response.status === 401) {
            token = await this.getAuthToken(true);
            response = await this.requestManager.schedule(makeRequest(token), 1);
        }
        if (response.status >= 400) {
            throw new Error(`YuriGarden API error (${response.status}) on ${path}`);
        }
        return JSON.parse(response.data ?? '{}');
    }
    async getMangaToken(comicId, chapterId, forceRefresh = false) {
        if (!forceRefresh && this.mangaTokenCache && Date.now() < this.mangaTokenCache.expiresAtMs - TOKEN_REFRESH_MARGIN_MS) {
            return this.mangaTokenCache.token;
        }
        const request = App.createRequest({
            url: `${SITE_URL}/comic/${comicId}/${chapterId}`,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, 1);
        const html = response.data ?? '';
        const match = /mangaToken\s*:(?:\s*\$R\[\d+\]\s*=)?\s*\{[^}]*token\s*:\s*["']([^"']+)["'](?:[^}]*expiresAt\s*:\s*["']([^"']+)["'])?/i.exec(html);
        const token = match?.[1];
        if (!token) {
            throw new Error('Failed to extract chapter decryption token from YuriGarden');
        }
        const parsedExpiry = match?.[2] ? Date.parse(match[2]) : NaN;
        const defaultExpiry = Date.now() + 10 * 60 * 1000;
        const expiresAtMs = !isNaN(parsedExpiry) && parsedExpiry > Date.now()
            ? Math.min(parsedExpiry, Date.now() + MANGA_TOKEN_TTL_CAP_MS)
            : defaultExpiry;
        this.mangaTokenCache = {
            token,
            expiresAtMs,
        };
        return token;
    }
    mapComicSummary(comic) {
        return App.createPartialSourceManga({
            mangaId: String(comic.id),
            title: comic.title,
            image: resolveMediaUrl(comic.thumbnail),
            subtitle: comic.r18 ? '18+' : undefined,
        });
    }
    async getSourceMenu() {
        return App.createDUISection({
            id: 'yurigarden_settings',
            header: 'YuriGarden Settings',
            footer: 'Sign in with a YuriGarden email/password account. R18 can only be enabled while logged in. Set an Unscrambler Proxy URL to descramble chapter images.',
            isHidden: false,
            rows: async () => {
                const loggedIn = await this.isLoggedIn();
                const storedEmail = String((await this.stateManager.retrieve(KEY_EMAIL)) ?? '');
                const storedStatus = String((await this.stateManager.retrieve(KEY_AUTH_STATUS)) ?? '');
                const accountStatus = storedStatus || (loggedIn && storedEmail ? `Logged in: ${storedEmail}` : 'Not logged in');
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
                                await this.stateManager.store(KEY_EMAIL, String(newValue ?? '').trim());
                            },
                        }),
                    }),
                    App.createDUISecureInputField({
                        id: 'password',
                        label: 'Password',
                        value: App.createDUIBinding({
                            get: async () => String((await this.stateManager.keychain.retrieve(KEY_PASSWORD)) ?? ''),
                            set: async (newValue) => {
                                await this.stateManager.keychain.store(KEY_PASSWORD, String(newValue ?? ''));
                            },
                        }),
                    }),
                    App.createDUIButton({
                        id: 'sign_in',
                        label: 'Sign In',
                        onTap: async () => {
                            await this.signIn();
                        },
                    }),
                    App.createDUIButton({
                        id: 'sign_out',
                        label: 'Sign Out',
                        onTap: async () => {
                            await this.signOut();
                        },
                    }),
                    App.createDUISwitch({
                        id: 'enable_r18',
                        label: 'Enable R18 (Login Required)',
                        value: App.createDUIBinding({
                            get: async () => await this.isR18Enabled(),
                            set: async (newValue) => {
                                const wantsR18 = Boolean(newValue);
                                if (wantsR18 && !(await this.isLoggedIn())) {
                                    await this.stateManager.store(KEY_ENABLE_R18, false);
                                    await this.stateManager.store(KEY_AUTH_STATUS, 'Sign in required before enabling R18');
                                    return;
                                }
                                await this.stateManager.store(KEY_ENABLE_R18, wantsR18);
                            },
                        }),
                    }),
                    App.createDUIInputField({
                        id: 'proxy_url',
                        label: 'Unscrambler Proxy URL',
                        value: App.createDUIBinding({
                            get: async () => await this.getProxyUrl(),
                            set: async (newValue) => {
                                const cleaned = String(newValue ?? '').trim().replace(/\/+$/, '');
                                await this.stateManager.store(KEY_PROXY_URL, cleaned || DEFAULT_PROXY_URL);
                            },
                        }),
                    }),
                ];
            },
        });
    }
    async getHomePageSections(sectionCallback) {
        await this.getAuthToken(false);
        const r18Enabled = await this.isR18Enabled();
        const sectionDefs = [
            { id: 'latest', title: 'Mới cập nhật', containsMoreItems: true },
            { id: 'trending_day', title: 'Top ngày', containsMoreItems: false },
            { id: 'trending_week', title: 'Top tuần', containsMoreItems: false },
        ];
        if (r18Enabled) {
            sectionDefs.push({ id: 'trending_r18', title: 'Top R18', containsMoreItems: false }, { id: 'latest_r18', title: 'R18 Mới', containsMoreItems: true });
        }
        const sections = sectionDefs.map((def) => App.createHomeSection({
            id: def.id,
            title: def.title,
            containsMoreItems: def.containsMoreItems,
            type: types_1.HomeSectionType.singleRowNormal,
        }));
        for (const section of sections) {
            sectionCallback(section);
        }
        for (const section of sections) {
            let comics = [];
            if (section.id === 'latest') {
                const res = await this.apiGet(`/api/comics?page=1&limit=${PAGE_LIMIT}&allowR18=${r18Enabled}`);
                comics = res.comics ?? [];
            }
            else if (section.id === 'trending_day') {
                comics = await this.apiGet('/api/comics/rank/trending?viewType=day&trendingType=view&r18=false');
            }
            else if (section.id === 'trending_week') {
                comics = await this.apiGet('/api/comics/rank/trending?viewType=week&trendingType=view&r18=false');
            }
            else if (section.id === 'trending_r18') {
                comics = await this.apiGet('/api/comics/rank/trending?viewType=week&trendingType=view&r18=true');
            }
            else if (section.id === 'latest_r18') {
                const res = await this.apiGet(`/api/comics?page=1&limit=${PAGE_LIMIT}&r18=true`);
                comics = res.comics ?? [];
            }
            section.items = comics.map((comic) => this.mapComicSummary(comic));
            sectionCallback(section);
        }
    }
    async getViewMoreItems(homepageSectionId, metadata) {
        const page = metadata?.page ?? 1;
        const r18Enabled = await this.isR18Enabled();
        let queryUrl = `/api/comics?page=${page}&limit=${PAGE_LIMIT}&allowR18=${r18Enabled}`;
        if (homepageSectionId === 'latest_r18') {
            if (!r18Enabled) {
                return App.createPagedResults({ results: [] });
            }
            queryUrl = `/api/comics?page=${page}&limit=${PAGE_LIMIT}&r18=true`;
        }
        const data = await this.apiGet(queryUrl);
        const items = (data.comics ?? []).map((comic) => this.mapComicSummary(comic));
        const totalPages = data.totalPages ?? 1;
        return App.createPagedResults({
            results: items,
            metadata: page < totalPages ? { page: page + 1 } : undefined,
        });
    }
    async getSearchTags() {
        const request = App.createRequest({
            url: `${API_URL}/resources/systems_vi.json`,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, 1);
        const data = JSON.parse(response.data ?? '{}');
        const tags = Object.values(data.genres ?? {})
            .map((genre) => App.createTag({
            id: genre.slug,
            label: genre.name,
        }))
            .sort((a, b) => a.label.localeCompare(b.label));
        return [
            App.createTagSection({
                id: 'genres',
                label: 'Thể loại',
                tags,
            }),
        ];
    }
    async getSearchResults(query, metadata) {
        const page = metadata?.page ?? 1;
        const r18Enabled = await this.isR18Enabled();
        const params = [
            `page=${page}`,
            `limit=${PAGE_LIMIT}`,
            `allowR18=${r18Enabled}`,
        ];
        const keyword = query.title?.trim();
        if (keyword) {
            params.push(`search=${encodeURIComponent(keyword)}`);
        }
        if (query.includedTags && query.includedTags.length > 0) {
            const genres = query.includedTags.map((tag) => tag.id).join(',');
            params.push(`genre=${encodeURIComponent(genres)}`);
        }
        if (query.excludedTags && query.excludedTags.length > 0) {
            const blocked = query.excludedTags.map((tag) => tag.id).join(',');
            params.push(`blockGenres=${encodeURIComponent(blocked)}`);
        }
        const data = await this.apiGet(`/api/comics?${params.join('&')}`);
        const items = (data.comics ?? []).map((comic) => this.mapComicSummary(comic));
        const totalPages = data.totalPages ?? 1;
        return App.createPagedResults({
            results: items,
            metadata: page < totalPages ? { page: page + 1 } : undefined,
        });
    }
    async getMangaDetails(mangaId) {
        const comic = await this.apiGet(`/api/comics/${mangaId}`);
        const titles = [comic.title, ...(comic.anotherNames ?? [])]
            .map((t) => t.trim())
            .filter(Boolean);
        const author = (comic.authors ?? [])
            .map((a) => a.name ?? '')
            .filter(Boolean)
            .join(', ');
        const artist = (comic.artists ?? [])
            .map((a) => a.name ?? '')
            .filter(Boolean)
            .join(', ');
        const genreTags = (comic.genres ?? []).map((slug) => App.createTag({
            id: slug,
            label: slug,
        }));
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
        });
    }
    async getChapters(mangaId) {
        const chapters = await this.apiGet(`/api/chapters/comic/${mangaId}`);
        return chapters.map((ch, idx) => {
            const timestamp = ch.publishedAt ?? ch.lastUpdated;
            return App.createChapter({
                id: String(ch.id),
                chapNum: ch.order < 0 ? 0 : ch.order,
                volume: typeof ch.volume === 'number' ? ch.volume : undefined,
                name: formatChapterName(ch),
                group: ch.team?.name,
                time: timestamp ? new Date(timestamp) : undefined,
                langCode: 'vi',
                sortingIndex: chapters.length - idx,
            });
        });
    }
    decryptChapterPayload(payload, mangaToken) {
        if (!payload.encrypted) {
            return payload;
        }
        if (typeof payload.data !== 'string' || !payload.data) {
            return null;
        }
        try {
            const jsonText = (0, YuriGardenCrypto_1.decryptOpenSslAes)(payload.data, mangaToken);
            return JSON.parse(jsonText);
        }
        catch {
            return null;
        }
    }
    async getChapterDetails(mangaId, chapterId) {
        const rawPayload = await this.apiGet(`/api/chapters/pages/${chapterId}`);
        let resolved = null;
        if (!rawPayload.encrypted) {
            resolved = rawPayload;
        }
        else {
            let mangaToken = await this.getMangaToken(mangaId, chapterId, false);
            resolved = this.decryptChapterPayload(rawPayload, mangaToken);
            if (!resolved) {
                const fallbackPayload = await this.apiGet(`/api/chapters/pages/${chapterId}`, { 'x-chapter-key-fallback': 'previous' });
                resolved = this.decryptChapterPayload(fallbackPayload, mangaToken);
            }
            if (!resolved) {
                mangaToken = await this.getMangaToken(mangaId, chapterId, true);
                resolved = this.decryptChapterPayload(rawPayload, mangaToken);
            }
        }
        if (!resolved) {
            throw new Error('Failed to decrypt YuriGarden chapter pages');
        }
        if (resolved.isLocked && (!resolved.pages || resolved.pages.length === 0)) {
            throw new Error('This chapter requires a password on YuriGarden');
        }
        const proxyUrl = await this.getProxyUrl();
        const pages = [];
        for (const page of resolved.pages ?? []) {
            const cleanPath = (page.url ?? '').replace('_credit', '');
            const cdnUrl = resolveMediaUrl(cleanPath);
            if (!cdnUrl) {
                continue;
            }
            if (proxyUrl && page.key) {
                // Validate key before delegating to proxy so malformed keys fail fast
                (0, YuriGardenCrypto_1.decodeScrambleKey)(page.key);
                pages.push(`${proxyUrl}/unscramble?url=${encodeURIComponent(cdnUrl)}&key=${encodeURIComponent(page.key)}`);
            }
            else {
                pages.push(cdnUrl);
            }
        }
        return App.createChapterDetails({
            id: chapterId,
            mangaId,
            pages,
        });
    }
}
exports.YuriGarden = YuriGarden;

},{"./YuriGardenCrypto":63,"@paperback/types":61}],63:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeScrambleKey = exports.decryptOpenSslAes = exports.aes256CbcDecrypt = exports.md5 = exports.utf8BytesToString = exports.base64ToBytes = void 0;
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const FACTORIALS = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800];
const AES_SBOX = new Uint8Array([
    0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
    0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
    0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
    0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
    0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
    0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
    0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
    0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
    0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
    0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
    0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
    0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
    0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
    0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
    0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
    0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16,
]);
const AES_INV_SBOX = new Uint8Array(256);
for (let i = 0; i < 256; i++) {
    AES_INV_SBOX[AES_SBOX[i] ?? 0] = i;
}
const AES_RCON = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36];
const MD5_SHIFTS = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
];
const MD5_K = new Uint32Array(64);
for (let i = 0; i < 64; i++) {
    MD5_K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000) >>> 0;
}
function base64ToBytes(b64) {
    const clean = b64.replace(/[^A-Za-z0-9+/=]/g, '');
    const len = clean.length;
    if (len % 4 !== 0) {
        throw new Error('Invalid base64 string');
    }
    let padding = 0;
    if (len >= 2) {
        if (clean[len - 1] === '=')
            padding++;
        if (clean[len - 2] === '=')
            padding++;
    }
    const out = new Uint8Array((len / 4) * 3 - padding);
    const lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let outIdx = 0;
    for (let i = 0; i < len; i += 4) {
        const c0 = lookup.indexOf(clean[i] ?? '');
        const c1 = lookup.indexOf(clean[i + 1] ?? '');
        const c2 = clean[i + 2] === '=' ? 0 : lookup.indexOf(clean[i + 2] ?? '');
        const c3 = clean[i + 3] === '=' ? 0 : lookup.indexOf(clean[i + 3] ?? '');
        const triplet = (c0 << 18) | (c1 << 12) | (c2 << 6) | c3;
        out[outIdx++] = (triplet >>> 16) & 0xff;
        if (clean[i + 2] !== '=')
            out[outIdx++] = (triplet >>> 8) & 0xff;
        if (clean[i + 3] !== '=')
            out[outIdx++] = triplet & 0xff;
    }
    return out;
}
exports.base64ToBytes = base64ToBytes;
function utf8BytesToString(bytes) {
    let result = '';
    let i = 0;
    while (i < bytes.length) {
        const b1 = bytes[i++] ?? 0;
        if (b1 < 0x80) {
            result += String.fromCharCode(b1);
        }
        else if (b1 >= 0xc0 && b1 < 0xe0) {
            const b2 = bytes[i++] ?? 0;
            result += String.fromCharCode(((b1 & 0x1f) << 6) | (b2 & 0x3f));
        }
        else if (b1 >= 0xe0 && b1 < 0xf0) {
            const b2 = bytes[i++] ?? 0;
            const b3 = bytes[i++] ?? 0;
            result += String.fromCharCode(((b1 & 0x0f) << 12) | ((b2 & 0x3f) << 6) | (b3 & 0x3f));
        }
        else {
            const b2 = bytes[i++] ?? 0;
            const b3 = bytes[i++] ?? 0;
            const b4 = bytes[i++] ?? 0;
            let cp = ((b1 & 0x07) << 18) | ((b2 & 0x3f) << 12) | ((b3 & 0x3f) << 6) | (b4 & 0x3f);
            cp -= 0x10000;
            result += String.fromCharCode(0xd800 + (cp >> 10), 0xdc00 + (cp & 0x3ff));
        }
    }
    return result;
}
exports.utf8BytesToString = utf8BytesToString;
function rotl(x, n) {
    return ((x << n) | (x >>> (32 - n))) >>> 0;
}
function md5(data) {
    const bitLen = data.length * 8;
    const paddedLen = (((data.length + 8) >>> 6) + 1) * 64;
    const padded = new Uint8Array(paddedLen);
    padded.set(data);
    padded[data.length] = 0x80;
    const view = new DataView(padded.buffer);
    view.setUint32(paddedLen - 8, bitLen >>> 0, true);
    view.setUint32(paddedLen - 4, Math.floor(bitLen / 0x100000000) >>> 0, true);
    let a0 = 0x67452301;
    let b0 = 0xefcdab89;
    let c0 = 0x98badcfe;
    let d0 = 0x10325476;
    const m = new Uint32Array(16);
    for (let offset = 0; offset < paddedLen; offset += 64) {
        for (let j = 0; j < 16; j++) {
            m[j] = view.getUint32(offset + j * 4, true);
        }
        let a = a0;
        let b = b0;
        let c = c0;
        let d = d0;
        for (let i = 0; i < 64; i++) {
            let f;
            let g;
            if (i < 16) {
                f = (b & c) | (~b & d);
                g = i;
            }
            else if (i < 32) {
                f = (d & b) | (~d & c);
                g = (5 * i + 1) % 16;
            }
            else if (i < 48) {
                f = b ^ c ^ d;
                g = (3 * i + 5) % 16;
            }
            else {
                f = c ^ (b | ~d);
                g = (7 * i) % 16;
            }
            const kVal = MD5_K[i] ?? 0;
            const mVal = m[g] ?? 0;
            const shift = MD5_SHIFTS[i] ?? 0;
            const temp = d;
            d = c;
            c = b;
            b = (b + rotl((a + f + kVal + mVal) >>> 0, shift)) >>> 0;
            a = temp;
        }
        a0 = (a0 + a) >>> 0;
        b0 = (b0 + b) >>> 0;
        c0 = (c0 + c) >>> 0;
        d0 = (d0 + d) >>> 0;
    }
    const digest = new Uint8Array(16);
    const outView = new DataView(digest.buffer);
    outView.setUint32(0, a0, true);
    outView.setUint32(4, b0, true);
    outView.setUint32(8, c0, true);
    outView.setUint32(12, d0, true);
    return digest;
}
exports.md5 = md5;
function xtime(a) {
    return ((a << 1) ^ (a & 0x80 ? 0x1b : 0)) & 0xff;
}
function gfMul(a, b) {
    let res = 0;
    let x = a;
    let y = b;
    for (let i = 0; i < 8; i++) {
        if (y & 1)
            res ^= x;
        x = xtime(x);
        y >>>= 1;
    }
    return res;
}
function expandAes256Key(key) {
    const rk = new Uint8Array(240);
    rk.set(key.subarray(0, 32));
    let bytesGenerated = 32;
    let rconIdx = 0;
    const temp = new Uint8Array(4);
    while (bytesGenerated < 240) {
        for (let i = 0; i < 4; i++) {
            temp[i] = rk[bytesGenerated - 4 + i] ?? 0;
        }
        if (bytesGenerated % 32 === 0) {
            const t0 = temp[0] ?? 0;
            temp[0] = AES_SBOX[temp[1] ?? 0] ?? 0;
            temp[1] = AES_SBOX[temp[2] ?? 0] ?? 0;
            temp[2] = AES_SBOX[temp[3] ?? 0] ?? 0;
            temp[3] = AES_SBOX[t0] ?? 0;
            temp[0] = (temp[0] ?? 0) ^ (AES_RCON[rconIdx++] ?? 0);
        }
        else if (bytesGenerated % 32 === 16) {
            for (let i = 0; i < 4; i++) {
                temp[i] = AES_SBOX[temp[i] ?? 0] ?? 0;
            }
        }
        for (let i = 0; i < 4; i++) {
            rk[bytesGenerated] = (rk[bytesGenerated - 32] ?? 0) ^ (temp[i] ?? 0);
            bytesGenerated++;
        }
    }
    return rk;
}
function addRoundKey(state, rk, round) {
    const offset = round * 16;
    for (let i = 0; i < 16; i++) {
        state[i] = (state[i] ?? 0) ^ (rk[offset + i] ?? 0);
    }
}
function invSubBytes(state) {
    for (let i = 0; i < 16; i++) {
        state[i] = AES_INV_SBOX[state[i] ?? 0] ?? 0;
    }
}
function invShiftRows(state) {
    let t = state[13] ?? 0;
    state[13] = state[9] ?? 0;
    state[9] = state[5] ?? 0;
    state[5] = state[1] ?? 0;
    state[1] = t;
    const t2a = state[2] ?? 0;
    const t2b = state[6] ?? 0;
    state[2] = state[10] ?? 0;
    state[6] = state[14] ?? 0;
    state[10] = t2a;
    state[14] = t2b;
    t = state[3] ?? 0;
    state[3] = state[7] ?? 0;
    state[7] = state[11] ?? 0;
    state[11] = state[15] ?? 0;
    state[15] = t;
}
function invMixColumns(state) {
    for (let c = 0; c < 4; c++) {
        const i = c * 4;
        const s0 = state[i] ?? 0;
        const s1 = state[i + 1] ?? 0;
        const s2 = state[i + 2] ?? 0;
        const s3 = state[i + 3] ?? 0;
        state[i] = gfMul(s0, 14) ^ gfMul(s1, 11) ^ gfMul(s2, 13) ^ gfMul(s3, 9);
        state[i + 1] = gfMul(s0, 9) ^ gfMul(s1, 14) ^ gfMul(s2, 11) ^ gfMul(s3, 13);
        state[i + 2] = gfMul(s0, 13) ^ gfMul(s1, 9) ^ gfMul(s2, 14) ^ gfMul(s3, 11);
        state[i + 3] = gfMul(s0, 11) ^ gfMul(s1, 13) ^ gfMul(s2, 9) ^ gfMul(s3, 14);
    }
}
function aes256CbcDecrypt(ciphertext, key, iv) {
    if (ciphertext.length === 0 || ciphertext.length % 16 !== 0) {
        throw new Error('Invalid AES ciphertext length');
    }
    const rk = expandAes256Key(key);
    const out = new Uint8Array(ciphertext.length);
    const state = new Uint8Array(16);
    let prev = iv;
    for (let offset = 0; offset < ciphertext.length; offset += 16) {
        const block = ciphertext.subarray(offset, offset + 16);
        state.set(block);
        addRoundKey(state, rk, 14);
        for (let round = 13; round >= 1; round--) {
            invShiftRows(state);
            invSubBytes(state);
            addRoundKey(state, rk, round);
            invMixColumns(state);
        }
        invShiftRows(state);
        invSubBytes(state);
        addRoundKey(state, rk, 0);
        for (let i = 0; i < 16; i++) {
            out[offset + i] = (state[i] ?? 0) ^ (prev[i] ?? 0);
        }
        prev = block;
    }
    const pad = out[out.length - 1] ?? 0;
    if (pad < 1 || pad > 16) {
        throw new Error('Invalid PKCS#7 padding');
    }
    for (let i = out.length - pad; i < out.length; i++) {
        if (out[i] !== pad) {
            throw new Error('Invalid PKCS#7 padding');
        }
    }
    return out.subarray(0, out.length - pad);
}
exports.aes256CbcDecrypt = aes256CbcDecrypt;
function concatBytes(...chunks) {
    let total = 0;
    for (const c of chunks)
        total += c.length;
    const res = new Uint8Array(total);
    let offset = 0;
    for (const c of chunks) {
        res.set(c, offset);
        offset += c.length;
    }
    return res;
}
function decryptOpenSslAes(base64Data, passphrase) {
    const raw = base64ToBytes(base64Data);
    if (raw.length < 16) {
        throw new Error('Encrypted payload too short');
    }
    // Check OpenSSL "Salted__" header (8 bytes)
    const prefix = 'Salted__';
    for (let i = 0; i < 8; i++) {
        if (raw[i] !== prefix.charCodeAt(i)) {
            throw new Error('Missing OpenSSL Salted__ header');
        }
    }
    const salt = raw.subarray(8, 16);
    const ciphertext = raw.subarray(16);
    const passBytes = new Uint8Array(passphrase.length);
    for (let i = 0; i < passphrase.length; i++) {
        passBytes[i] = passphrase.charCodeAt(i) & 0xff;
    }
    const d1 = md5(concatBytes(passBytes, salt));
    const d2 = md5(concatBytes(d1, passBytes, salt));
    const d3 = md5(concatBytes(d2, passBytes, salt));
    const key = concatBytes(d1, d2);
    const iv = d3;
    const plainBytes = aes256CbcDecrypt(ciphertext, key, iv);
    return utf8BytesToString(plainBytes);
}
exports.decryptOpenSslAes = decryptOpenSslAes;
function decodeScrambleKey(rawKey) {
    const sliced = rawKey.slice(4);
    if (!/^H[1-9A-HJ-NP-Za-km-z]+$/.test(sliced)) {
        throw new Error(`Invalid scramble key: ${rawKey}`);
    }
    const body = sliced.slice(1, -1);
    const checksum = sliced.slice(-1);
    let n = 0;
    for (const ch of body) {
        const idx = BASE58_ALPHABET.indexOf(ch);
        if (idx < 0) {
            throw new Error(`Invalid base58 character in key: ${ch}`);
        }
        n = n * 58 + idx;
    }
    if (BASE58_ALPHABET[n % 58] !== checksum) {
        throw new Error('Scramble key checksum mismatch');
    }
    const pool = Array.from({ length: 10 }, (_v, idx) => idx);
    const order = [];
    let rem = n;
    for (let a = 9; a >= 0; a--) {
        const fact = FACTORIALS[a] ?? 1;
        const idx = Math.floor(rem / fact);
        rem = rem % fact;
        const picked = pool.splice(idx, 1)[0];
        if (picked === undefined) {
            throw new Error('Scramble permutation index out of bounds');
        }
        order.push(picked);
    }
    return order;
}
exports.decodeScrambleKey = decodeScrambleKey;

},{}]},{},[62])(62)
});
