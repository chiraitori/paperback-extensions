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
exports.KemonoDiscord = exports.KemonoDiscordInfo = void 0;
const types_1 = require("@paperback/types");
const KemonoSource_1 = require("../KemonoPatreon/includes/KemonoSource");
const SERVICE = 'discord';
const SERVICE_NAME = 'Discord';
exports.KemonoDiscordInfo = {
    version: '1.1.0',
    name: `Kemono ${SERVICE_NAME}`,
    icon: 'icon.png',
    author: 'chiraitori',
    authorWebsite: 'https://github.com/chiraitori/paperback-extensions',
    description: `Browse ${SERVICE_NAME} content archived on Kemono`,
    contentRating: types_1.ContentRating.ADULT,
    websiteBaseURL: `https://kemono.cr/${SERVICE}`,
    sourceTags: [
        { text: '18+', type: types_1.BadgeColor.YELLOW },
        { text: 'Kemono', type: types_1.BadgeColor.BLUE },
    ],
    intents: types_1.SourceIntents.MANGA_CHAPTERS | types_1.SourceIntents.HOMEPAGE_SECTIONS,
};
class KemonoDiscord extends KemonoSource_1.KemonoSource {
    constructor() {
        super(...arguments);
        this.service = SERVICE;
        this.serviceName = SERVICE_NAME;
    }
}
exports.KemonoDiscord = KemonoDiscord;

},{"../KemonoPatreon/includes/KemonoSource":63,"@paperback/types":61}],63:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KemonoSource = void 0;
const types_1 = require("@paperback/types");
const KEMONO_BASE_URL = 'https://kemono.cr';
const KEMONO_API_URL = `${KEMONO_BASE_URL}/api/v1`;
const KEMONO_IMAGE_URL = 'https://img.kemono.cr';
const PAGE_SIZE = 50;
class KemonoInterceptor {
    async interceptResponse(response) {
        return response;
    }
    async interceptRequest(request) {
        request.headers = {
            ...request.headers,
            Accept: 'text/css',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            Referer: KEMONO_BASE_URL,
        };
        return request;
    }
}
class KemonoSource extends types_1.Source {
    constructor() {
        super(...arguments);
        this.requestManager = App.createRequestManager({
            requestsPerSecond: 3,
            requestTimeout: 30000,
            interceptor: new KemonoInterceptor(),
        });
    }
    getMangaShareUrl(mangaId) {
        const parts = mangaId.split('/');
        const userId = parts[0] === 'creator' ? parts[1] : parts[1];
        const creatorType = this.service === 'discord' ? 'server' : 'user';
        return `${KEMONO_BASE_URL}/${this.service}/${creatorType}/${userId}`;
    }
    creatorMangaId(creator) {
        return `creator/${creator.id}/${encodeURIComponent(creator.name || creator.id)}`;
    }
    creatorIcon(userId) {
        return `${KEMONO_IMAGE_URL}/icons/${this.service}/${userId}`;
    }
    isImage(file) {
        const filename = `${file.name || ''}${file.path || ''}`.toLowerCase();
        return /\.(avif|bmp|gif|jpe?g|png|webp)(?:$|\?)/.test(filename);
    }
    isVideo(file) {
        const filename = `${file.name || ''}${file.path || ''}`.toLowerCase();
        return /\.(avi|m4v|mkv|mov|mp4|webm)(?:$|\?)/.test(filename);
    }
    thumbnailUrl(path) {
        return path ? `${KEMONO_IMAGE_URL}/thumbnail/data${path}` : '';
    }
    fileUrl(file) {
        if (!file.path)
            return '';
        if (/^https?:\/\//i.test(file.path))
            return file.path;
        const name = file.name ? `?f=${encodeURIComponent(file.name)}` : '';
        return `${KEMONO_BASE_URL}/data${file.path}${name}`;
    }
    cleanText(value) {
        if (!value)
            return 'No description';
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
            .trim() || 'No description';
    }
    async getJson(url) {
        let lastError;
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                const request = App.createRequest({ url, method: 'GET' });
                const response = await this.requestManager.schedule(request, 1);
                return JSON.parse(response.data ?? 'null');
            }
            catch (error) {
                lastError = error;
            }
        }
        throw lastError;
    }
    async getCreators() {
        const data = await this.getJson(`${KEMONO_API_URL}/creators`);
        const creators = Array.isArray(data) ? data : (data?.artists ?? []);
        return creators.filter(creator => creator.service === this.service);
    }
    async getCreatorPosts(userId) {
        const posts = [];
        for (let offset = 0; offset < 200; offset += PAGE_SIZE) {
            const data = await this.getJson(`${KEMONO_API_URL}/${this.service}/user/${userId}/posts?o=${offset}`);
            const page = Array.isArray(data) ? data : (data?.posts ?? []);
            posts.push(...page);
            if (page.length < PAGE_SIZE)
                break;
        }
        return posts;
    }
    async getPost(userId, postId) {
        const data = await this.getJson(`${KEMONO_API_URL}/${this.service}/user/${userId}/post/${postId}`);
        const result = data?.post ? data : { post: data };
        if (!result.post?.id)
            throw new Error('Kemono returned an invalid post');
        return result;
    }
    postFiles(result) {
        const post = result.post;
        const files = [post.file, ...(post.attachments ?? []), ...(result.previews ?? []), ...(result.attachments ?? []), ...(result.videos ?? [])]
            .filter((file) => !!file?.path);
        const seen = {};
        return files.filter(file => {
            const path = file.path;
            if (seen[path])
                return false;
            seen[path] = true;
            return true;
        });
    }
    creatorTile(creator) {
        return App.createPartialSourceManga({
            mangaId: this.creatorMangaId(creator),
            title: creator.name || creator.id,
            image: this.creatorIcon(creator.id),
            subtitle: `${creator.favorited ?? 0} favorites`,
        });
    }
    async getHomePageSections(sectionCallback) {
        const section = App.createHomeSection({
            id: 'recent-creators',
            title: `Recently Updated ${this.serviceName} Creators`,
            containsMoreItems: true,
            type: types_1.HomeSectionType.singleRowNormal,
        });
        sectionCallback(section);
        try {
            const creators = await this.getCreators();
            creators.sort((a, b) => Number(b.updated ?? 0) - Number(a.updated ?? 0));
            section.items = creators.slice(0, 20).map(creator => this.creatorTile(creator));
            sectionCallback(section);
        }
        catch (error) {
            console.log(`Kemono homepage error: ${error}`);
        }
    }
    async getViewMoreItems(_homepageSectionId, metadata) {
        const offset = Number(metadata?.offset ?? 20);
        const creators = await this.getCreators();
        creators.sort((a, b) => Number(b.updated ?? 0) - Number(a.updated ?? 0));
        const results = creators.slice(offset, offset + 20).map(creator => this.creatorTile(creator));
        const nextMetadata = offset + results.length < creators.length ? { offset: offset + results.length } : undefined;
        return App.createPagedResults({ results, metadata: nextMetadata });
    }
    async getMangaDetails(mangaId) {
        const parts = mangaId.split('/');
        if (parts[0] === 'creator') {
            const userId = parts[1];
            const name = decodeURIComponent(parts.slice(2).join('/') || userId);
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
            });
        }
        const userId = parts[1];
        const postId = parts[2];
        const result = await this.getPost(userId, postId);
        const post = result.post;
        const files = this.postFiles(result);
        const cover = files.find(file => this.isImage(file));
        const videoCount = files.filter(file => this.isVideo(file)).length;
        const videoNote = videoCount ? `Contains ${videoCount} video attachment(s).\n\n` : '';
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
        });
    }
    async getChapters(mangaId) {
        const parts = mangaId.split('/');
        if (parts[0] === 'creator') {
            if (this.service === 'discord') {
                const server = await this.getJson(`${KEMONO_API_URL}/discord/server/${parts[1]}`);
                const channels = server?.channels ?? [];
                return channels.map((channel, index) => App.createChapter({
                    id: `channel/${channel.id}`,
                    name: channel.name || `Channel ${channel.id}`,
                    chapNum: channels.length - index,
                    langCode: 'en',
                }));
            }
            const posts = await this.getCreatorPosts(parts[1]);
            return posts.map((post, index) => App.createChapter({
                id: `post/${post.id}`,
                name: post.title || `Post ${post.id}`,
                chapNum: posts.length - index,
                langCode: 'en',
            }));
        }
        return [App.createChapter({
                id: `post/${parts[2]}`,
                name: 'Images',
                chapNum: 1,
                langCode: 'en',
            })];
    }
    async getChapterDetails(mangaId, chapterId) {
        const mangaParts = mangaId.split('/');
        const userId = mangaParts[1];
        if (this.service === 'discord' && chapterId.startsWith('channel/')) {
            const channelId = chapterId.split('/')[1];
            const messages = await this.getJson(`${KEMONO_API_URL}/discord/channel/${channelId}?o=0`);
            const pages = [];
            for (const message of messages) {
                for (const file of message.attachments ?? []) {
                    if (this.isImage(file))
                        pages.push(this.fileUrl(file));
                }
                for (const embed of message.embeds ?? []) {
                    const image = embed.image?.url || embed.image?.proxy_url || embed.thumbnail?.url || embed.thumbnail?.proxy_url;
                    if (image)
                        pages.push(image);
                }
            }
            const uniquePages = pages.filter((page, index) => pages.indexOf(page) === index);
            if (!uniquePages.length)
                uniquePages.push(this.creatorIcon(userId));
            return App.createChapterDetails({ id: chapterId, mangaId, pages: uniquePages });
        }
        const postId = chapterId.split('/')[1] || mangaParts[2];
        const result = await this.getPost(userId, postId);
        const imageFiles = this.postFiles(result).filter(file => this.isImage(file));
        const pages = imageFiles.map(file => this.fileUrl(file)).filter(Boolean);
        if (!pages.length)
            pages.push(this.creatorIcon(userId));
        return App.createChapterDetails({ id: chapterId, mangaId, pages });
    }
    async getSearchResults(query, metadata) {
        const searchQuery = (query.title ?? '').trim().toLowerCase();
        if (!searchQuery)
            return App.createPagedResults({ results: [] });
        const offset = Number(metadata?.offset ?? 0);
        const creators = (await this.getCreators())
            .filter(creator => creator.id.toLowerCase().includes(searchQuery) || creator.name.toLowerCase().includes(searchQuery))
            .sort((a, b) => Number(b.favorited ?? 0) - Number(a.favorited ?? 0));
        const results = creators.slice(offset, offset + 20).map(creator => this.creatorTile(creator));
        const nextMetadata = offset + results.length < creators.length ? { offset: offset + results.length } : undefined;
        return App.createPagedResults({ results, metadata: nextMetadata });
    }
    async getTags() {
        return [];
    }
    async supportsTagExclusion() {
        return false;
    }
}
exports.KemonoSource = KemonoSource;

},{"@paperback/types":61}]},{},[62])(62)
});
