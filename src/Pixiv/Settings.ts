import {
    DUINavigationButton,
    SourceStateManager
} from '@paperback/types'

export const getServerURL = async (stateManager: SourceStateManager): Promise<string> => {
    return (await stateManager.retrieve('serverURL') as string) ?? 'https://image.chiraitori.io.vn'
}

export const serverSettingsMenu = (stateManager: SourceStateManager): DUINavigationButton => {
    return App.createDUINavigationButton({
        id: 'server_settings',
        label: 'Server Settings',
        form: App.createDUIForm({
            sections: async () => {
                const serverURL = await getServerURL(stateManager)
                
                return [
                    App.createDUISection({
                        id: 'server',
                        header: 'Image-API Server',
                        footer: 'Enter the URL of your image-api server (default: https://image.chiraitori.io.vn)',
                        isHidden: false,
                        rows: async () => [
                            App.createDUIInputField({
                                id: 'serverURL',
                                label: 'Server URL',
                                value: App.createDUIBinding({
                                    get: async () => serverURL,
                                    set: async (value) => {
                                        await stateManager.store('serverURL', value)
                                    }
                                })
                            }),
                        ]
                    }),
                    App.createDUISection({
                        id: 'info',
                        header: 'Information',
                        isHidden: false,
                        rows: async () => [
                            App.createDUILabel({
                                id: 'info_label',
                                label: 'How to use',
                                value: '1. Run image-api server\n2. Enter server URL above\n3. Browse Pixiv manga!'
                            }),
                        ]
                    }),
                ]
            }
        })
    })
}
