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
exports.EHentai = exports.EHentaiInfo = void 0;
const types_1 = require("@paperback/types");
const BASE_URL = 'https://e-hentai.org';
const DEFAULT_CATEGORIES = 0;
const ALL_CATEGORIES = 1023;
const THUMBNAILS_PER_PAGE = 20;
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
];
const HOME_SECTIONS = [
    { id: 'latest', title: 'Latest Galleries', categories: DEFAULT_CATEGORIES },
    { id: 'doujinshi', title: 'Latest Doujinshi', categories: ALL_CATEGORIES - 2 },
    { id: 'manga', title: 'Latest Manga', categories: ALL_CATEGORIES - 4 },
];
const parseGalleryIdentifier = (value) => {
    const match = /(?:\/g\/)?(\d+)\/([a-z0-9]+)/i.exec(value);
    if (!match?.[1] || !match[2]) {
        throw new Error(`Invalid E-Hentai gallery identifier: ${value}`);
    }
    return { gid: match[1], token: match[2] };
};
const normalizeUrl = (value) => {
    if (value.startsWith('//'))
        return `https:${value}`;
    if (value.startsWith('/'))
        return `${BASE_URL}${value}`;
    return value;
};
const extractCssUrl = (style) => {
    const match = /url\((?:['"])?([^'")]+)(?:['"])?\)/i.exec(style);
    return normalizeUrl(match?.[1] ?? '');
};
const languageCodeFor = (language) => {
    const codes = {
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
    };
    return codes[language.toLowerCase()] ?? 'jp';
};
class EHentaiInterceptor {
    async interceptRequest(request) {
        request.headers = {
            ...request.headers,
            Accept: 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
            Referer: `${BASE_URL}/`,
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
        };
        const cookies = request.cookies ?? [];
        if (!cookies.some(cookie => cookie.name === 'nw')) {
            cookies.push(App.createCookie({
                name: 'nw',
                value: '1',
                domain: 'e-hentai.org',
                path: '/',
            }));
        }
        request.cookies = cookies;
        return request;
    }
    async interceptResponse(response) {
        return response;
    }
}
exports.EHentaiInfo = {
    version: '1.0.1',
    name: 'E-Hentai',
    icon: 'icon.png',
    author: 'chiraitori',
    authorWebsite: 'https://github.com/chiraitori/paperback-extensions',
    description: 'Browse and read public E-Hentai galleries with search and category filters.',
    contentRating: types_1.ContentRating.ADULT,
    websiteBaseURL: BASE_URL,
    sourceTags: [
        { text: '18+', type: types_1.BadgeColor.RED },
        { text: 'Gallery', type: types_1.BadgeColor.BLUE },
    ],
    intents: types_1.SourceIntents.MANGA_CHAPTERS | types_1.SourceIntents.HOMEPAGE_SECTIONS,
};
class EHentai extends types_1.Source {
    constructor() {
        super(...arguments);
        this.requestManager = App.createRequestManager({
            requestsPerSecond: 6,
            requestTimeout: 30000,
            interceptor: new EHentaiInterceptor(),
        });
    }
    getMangaShareUrl(mangaId) {
        const { gid, token } = parseGalleryIdentifier(mangaId);
        return `${BASE_URL}/g/${gid}/${token}/`;
    }
    async getSearchTags() {
        return [App.createTagSection({
                id: 'categories',
                label: 'Categories',
                tags: CATEGORY_TAGS.map(category => App.createTag({
                    id: category.id,
                    label: category.label,
                })),
            })];
    }
    async supportsTagExclusion() {
        return true;
    }
    async supportsSearchOperators() {
        return true;
    }
    async getHomePageSections(sectionCallback) {
        const sections = HOME_SECTIONS.map(definition => App.createHomeSection({
            id: definition.id,
            title: definition.title,
            type: types_1.HomeSectionType.singleRowNormal,
            containsMoreItems: true,
        }));
        sections.forEach(sectionCallback);
        await Promise.all(sections.map(async (section, index) => {
            const definition = HOME_SECTIONS[index];
            if (!definition)
                return;
            try {
                const page = await this.getGalleryResults('', definition.categories);
                section.items = page.results;
                sectionCallback(section);
            }
            catch (error) {
                console.log(`[E-Hentai] Failed to load ${section.id}: ${error}`);
            }
        }));
    }
    async getViewMoreItems(homepageSectionId, metadata) {
        const definition = HOME_SECTIONS.find(section => section.id === homepageSectionId);
        if (!definition)
            return App.createPagedResults({ results: [] });
        return this.getGalleryResults('', definition.categories, metadata?.next);
    }
    async getSearchResults(query, metadata) {
        return this.getGalleryResults(query.title?.trim() ?? '', this.categoriesForQuery(query), metadata?.next);
    }
    async getMangaDetails(mangaId) {
        const gallery = await this.getGalleryPageData(mangaId);
        const titles = [gallery.title];
        if (gallery.japaneseTitle && gallery.japaneseTitle !== gallery.title) {
            titles.push(gallery.japaneseTitle);
        }
        const details = [
            gallery.category,
            gallery.pageCount > 0 ? `${gallery.pageCount} pages` : '',
            gallery.uploader ? `Uploaded by ${gallery.uploader}` : '',
        ].filter(Boolean).join(' • ');
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
        });
    }
    async getChapters(mangaId) {
        const gallery = await this.getGalleryPageData(mangaId);
        return [App.createChapter({
                id: String(Math.max(1, gallery.pageCount)),
                name: gallery.title,
                chapNum: 1,
                langCode: gallery.language,
                time: gallery.posted,
            })];
    }
    async getChapterDetails(mangaId, chapterId) {
        const pageCount = Math.max(1, Number.parseInt(chapterId, 10) || 1);
        const imagePageUrls = await this.getImagePageUrls(mangaId, pageCount);
        const pages = [];
        for (let index = 0; index < imagePageUrls.length; index += 20) {
            const batch = imagePageUrls.slice(index, index + 20);
            const imageUrls = await Promise.all(batch.map(async (url) => {
                try {
                    return await this.getImageUrl(url);
                }
                catch (error) {
                    console.log(`[E-Hentai] Failed to resolve image page ${url}: ${error}`);
                    return '';
                }
            }));
            pages.push(...imageUrls.filter(Boolean));
        }
        if (pages.length === 0) {
            throw new Error('E-Hentai returned no readable image pages. The gallery may be unavailable or the image limit was reached.');
        }
        return App.createChapterDetails({
            id: chapterId,
            mangaId,
            pages,
        });
    }
    categoriesForQuery(query) {
        const included = (query.includedTags ?? [])
            .map(tag => CATEGORY_TAGS.find(category => category.id === tag.id)?.bit)
            .filter((bit) => bit !== undefined);
        const excluded = (query.excludedTags ?? [])
            .map(tag => CATEGORY_TAGS.find(category => category.id === tag.id)?.bit)
            .filter((bit) => bit !== undefined);
        if (included.length > 0) {
            const includedMask = included.reduce((sum, bit) => sum + bit, 0);
            return Math.max(0, ALL_CATEGORIES - includedMask);
        }
        return excluded.reduce((sum, bit) => sum + bit, 0);
    }
    async getGalleryResults(query, categories, next) {
        const params = [
            `f_cats=${categories}`,
            `f_search=${encodeURIComponent(query)}`,
        ];
        if (next)
            params.unshift(`next=${encodeURIComponent(next)}`);
        const html = await this.get(`${BASE_URL}/?${params.join('&')}`);
        const $ = this.cheerio.load(html);
        const results = [];
        $('tr').each((_index, row) => {
            if ($('td.glname', row).length === 0)
                return;
            const link = $('td.glname a[href*="/g/"]', row).first();
            const href = link.attr('href') ?? '';
            let identifier;
            try {
                identifier = parseGalleryIdentifier(href);
            }
            catch {
                return;
            }
            const imageElement = $('div.glthumb img', row).first();
            const image = normalizeUrl(imageElement.attr('data-src') ?? imageElement.attr('src') ?? '');
            const category = $('td.glcat div', row).first().text().trim();
            const pageText = $('td.gl4c div', row).last().text().trim();
            const uploader = $('td.gl4c a', row).first().text().trim();
            results.push(App.createPartialSourceManga({
                mangaId: `${identifier.gid}/${identifier.token}`,
                title: $('.glink', row).first().text().trim() || imageElement.attr('alt') || 'Untitled Gallery',
                image,
                subtitle: [category, pageText, uploader].filter(Boolean).join(' • '),
            }));
        });
        const nextHref = $('#unext').attr('href') ?? '';
        const nextMatch = /[?&]next=(\d+)/.exec(nextHref);
        return App.createPagedResults({
            results,
            metadata: nextMatch?.[1] ? { next: nextMatch[1] } : undefined,
        });
    }
    async getGalleryPageData(mangaId) {
        const identifier = parseGalleryIdentifier(mangaId);
        const html = await this.get(`${BASE_URL}/g/${identifier.gid}/${identifier.token}/`);
        const $ = this.cheerio.load(html);
        const info = {};
        $('#gdd tr').each((_index, row) => {
            const label = $('td.gdt1', row).text().replace(':', '').trim().toLowerCase();
            const value = $('td.gdt2', row).text().trim();
            if (label)
                info[label] = value;
        });
        const tagSections = [];
        const tagValues = {};
        $('#taglist tr').each((_index, row) => {
            const namespace = $('td.tc', row).text().replace(':', '').trim().toLowerCase();
            if (!namespace)
                return;
            const labels = [];
            $('td:not(.tc) a', row).each((_tagIndex, element) => {
                const wrappedElement = element;
                const label = (typeof wrappedElement.text === 'function'
                    ? wrappedElement.text()
                    : $(element).text()).trim();
                if (label)
                    labels.push(label);
            });
            if (labels.length === 0)
                return;
            tagValues[namespace] = labels;
            tagSections.push(App.createTagSection({
                id: namespace,
                label: namespace.charAt(0).toUpperCase() + namespace.slice(1),
                tags: labels.map(label => App.createTag({
                    id: `${namespace}:${label}`,
                    label,
                })),
            }));
        });
        const category = $('#gdc').text().trim();
        const cover = normalizeUrl($('#gd1 img').attr('src') ?? '')
            || extractCssUrl($('#gd1 div').first().attr('style') ?? '');
        const pageCount = Number.parseInt(info.length ?? '', 10) || 1;
        const ratingText = $('#rating_label').text();
        const ratingMatch = /([0-9]+(?:\.[0-9]+)?)/.exec(ratingText);
        const posted = info.posted ? new Date(`${info.posted.replace(' ', 'T')}Z`) : undefined;
        const language = tagValues.language?.find(value => value.toLowerCase() !== 'translated') ?? 'japanese';
        const artist = tagValues.artist?.[0] ?? tagValues.group?.[0] ?? '';
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
        };
    }
    async getImagePageUrls(mangaId, pageCount) {
        const { gid, token } = parseGalleryIdentifier(mangaId);
        const urls = [];
        const seen = new Set();
        const expectedGalleryPages = Math.ceil(pageCount / THUMBNAILS_PER_PAGE);
        for (let page = 0; page < expectedGalleryPages + 2 && urls.length < pageCount; page++) {
            const suffix = page === 0 ? '' : `?p=${page}`;
            const html = await this.get(`${BASE_URL}/g/${gid}/${token}/${suffix}`);
            const $ = this.cheerio.load(html);
            const pageUrls = [];
            $('#gdt > a[href*="/s/"]').each((_linkIndex, element) => {
                const wrappedElement = element;
                const href = typeof wrappedElement.attr === 'function'
                    ? wrappedElement.attr('href')
                    : $(element).attr('href');
                const url = normalizeUrl(href ?? '');
                if (url)
                    pageUrls.push(url);
            });
            if (pageUrls.length === 0)
                break;
            let added = 0;
            for (const url of pageUrls) {
                if (seen.has(url))
                    continue;
                seen.add(url);
                urls.push(url);
                added++;
            }
            if (added === 0)
                break;
        }
        return urls.slice(0, pageCount);
    }
    async getImageUrl(imagePageUrl) {
        const html = await this.get(imagePageUrl);
        const $ = this.cheerio.load(html);
        return normalizeUrl($('#img').attr('src') ?? $('#i7 a').attr('href') ?? '');
    }
    async get(url) {
        const response = await this.requestManager.schedule(App.createRequest({
            url,
            method: 'GET',
        }), 2);
        if (response.status >= 400) {
            throw new Error(`E-Hentai returned HTTP ${response.status} for ${url}`);
        }
        return response.data ?? '';
    }
}
exports.EHentai = EHentai;

},{"@paperback/types":61}]},{},[62])(62)
});
