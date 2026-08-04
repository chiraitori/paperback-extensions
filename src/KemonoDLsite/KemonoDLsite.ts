import { BadgeColor, ContentRating, SourceInfo, SourceIntents } from '@paperback/types'
import { KemonoSource } from '../KemonoPatreon/includes/KemonoSource'

const SERVICE = 'dlsite'
const SERVICE_NAME = 'DLsite'

export const KemonoDLsiteInfo: SourceInfo = {
    version: '1.1.0',
    name: `Kemono ${SERVICE_NAME}`,
    icon: 'icon.png',
    author: 'chiraitori',
    authorWebsite: 'https://github.com/chiraitori/paperback-extensions',
    description: `Browse ${SERVICE_NAME} content archived on Kemono`,
    contentRating: ContentRating.ADULT,
    websiteBaseURL: `https://kemono.cr/${SERVICE}`,
    sourceTags: [
        { text: '18+', type: BadgeColor.YELLOW },
        { text: 'Kemono', type: BadgeColor.BLUE },
    ],
    intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.HOMEPAGE_SECTIONS,
}

export class KemonoDLsite extends KemonoSource {
    readonly service = SERVICE
    readonly serviceName = SERVICE_NAME
}
