import { PageProviderContext } from '../components/PageProvider/PageProvider';

export const mockPageContext: PageProviderContext = {
    layout: {
        header: true,
        footer: true,
        body: {
            rows: [
                {
                    styleClass: 'row',
                    columns: [
                        {
                            styleClass: 'col-md-12',
                            width: 6,
                            leftOffset: 3,
                            containers: [
                                {
                                    identifier: 'container-1',
                                    uuid: 'uuid-1'
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    },
    containers: {
        'container-1': {
            container: {
                path: 'path/to/container',
                identifier: 'container-1',
                maxContentlets: 100
            },
            containerStructures: [
                {
                    contentTypeVar: 'content-type-1'
                }
            ],
            contentlets: {
                'uuid-1': [
                    {
                        contentType: 'content-type-1',
                        identifier: 'contentlet-1',
                        title: 'Contentlet 1',
                        inode: 'inode-1'
                    }
                ]
            }
        }
    },
    page: { identifier: 'page-1', title: 'Hello Page' },
    viewAs: { language: { id: 'en' }, persona: { keyTag: 'persona-1' } },
    components: {}
};
