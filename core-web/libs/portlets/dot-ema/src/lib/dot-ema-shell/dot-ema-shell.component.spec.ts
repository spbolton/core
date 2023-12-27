import { describe, expect } from '@jest/globals';
import { SpectatorRouting, byTestId, createRoutingFactory } from '@ngneat/spectator/jest';
import { of } from 'rxjs';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { ConfirmationService, MessageService } from 'primeng/api';

import { DotLanguagesService, DotMessageService, DotPersonalizeService } from '@dotcms/data-access';
import { SiteService, mockSites } from '@dotcms/dotcms-js';
import {
    DotLanguagesServiceMock,
    DotPersonalizeServiceMock,
    SiteServiceMock
} from '@dotcms/utils-testing';

import { DotEmaShellComponent } from './dot-ema-shell.component';
import { EditEmaStore } from './store/dot-ema.store';

import { DotActionUrlService } from '../services/dot-action-url/dot-action-url.service';
import { DotPageApiService } from '../services/dot-page-api.service';
import { DEFAULT_PERSONA, WINDOW } from '../shared/consts';
import { NG_CUSTOM_EVENTS } from '../shared/enums';

describe('DotEmaShellComponent', () => {
    let spectator: SpectatorRouting<DotEmaShellComponent>;
    let store: EditEmaStore;
    let siteService: SiteServiceMock;
    let router: Router;

    const createComponent = createRoutingFactory({
        component: DotEmaShellComponent,
        imports: [RouterTestingModule, HttpClientTestingModule],
        detectChanges: false,
        providers: [{ provide: SiteService, useClass: SiteServiceMock }],
        componentProviders: [
            MessageService,
            EditEmaStore,
            ConfirmationService,
            DotActionUrlService,
            DotMessageService,
            { provide: DotLanguagesService, useValue: new DotLanguagesServiceMock() },
            {
                provide: DotPageApiService,
                useValue: {
                    get() {
                        return of({
                            page: {
                                title: 'hello world',
                                identifier: '123',
                                inode: '123'
                            },
                            viewAs: {
                                language: {
                                    id: 1,
                                    language: 'English',
                                    countryCode: 'US',
                                    languageCode: 'EN',
                                    country: 'United States'
                                },
                                persona: DEFAULT_PERSONA
                            },
                            site: mockSites[0]
                        });
                    },
                    save() {
                        return of({});
                    },
                    getPersonas() {
                        return of({
                            entity: [DEFAULT_PERSONA],
                            pagination: {
                                totalEntries: 1,
                                perPage: 10,
                                page: 1
                            }
                        });
                    }
                }
            },

            {
                provide: WINDOW,
                useValue: window
            },
            {
                provide: DotPersonalizeService,
                useValue: new DotPersonalizeServiceMock()
            }
        ]
    });

    beforeEach(() => {
        spectator = createComponent();
        siteService = spectator.inject(SiteService) as unknown as SiteServiceMock;
        store = spectator.inject(EditEmaStore, true);
        router = spectator.inject(Router);
        jest.spyOn(store, 'load');
    });

    describe('DOM', () => {
        it('should have a navigation bar', () => {
            spectator.detectChanges();
            expect(spectator.query('dot-edit-ema-navigation-bar')).not.toBeNull();
        });
    });

    describe('router', () => {
        it('should trigger an store load with default values', () => {
            spectator.detectChanges();

            expect(store.load).toHaveBeenCalledWith({
                language_id: 1,
                url: 'index',
                persona_id: DEFAULT_PERSONA.identifier
            });
        });

        it('should trigger a load when changing the queryParams', () => {
            spectator.triggerNavigation({
                url: [],
                queryParams: {
                    language_id: 2,
                    url: 'my-awesome-page',
                    'com.dotmarketing.persona.id': 'SomeCoolDude'
                }
            });

            spectator.detectChanges();
            expect(store.load).toHaveBeenCalledWith({
                language_id: 2,
                url: 'my-awesome-page',
                persona_id: 'SomeCoolDude'
            });
        });
    });

    describe('Site Changes', () => {
        it('should trigger a navigate to /pages when site changes', async () => {
            const navigate = jest.spyOn(router, 'navigate');

            spectator.detectChanges();
            siteService.setFakeCurrentSite(); // We have to trigger the first set as dotcms on init
            siteService.setFakeCurrentSite();
            spectator.detectChanges();

            expect(navigate).toHaveBeenCalledWith(['/pages']);
        });
    });

    describe('page properties', () => {
        it('should open the dialog when triggering store.initEditAction with shell as context', () => {
            spectator.detectChanges();
            store.initActionEdit({
                inode: '123',
                title: 'hello world',
                type: 'shell'
            });
            spectator.detectChanges();

            expect(spectator.query(byTestId('dialog-iframe'))).not.toBeNull();
        });

        it('should trigger a navigate when saving and the url changed', () => {
            const navigate = jest.spyOn(router, 'navigate');

            spectator.detectChanges();
            store.initActionEdit({
                inode: '123',
                title: 'hello world',
                type: 'shell'
            });
            spectator.detectChanges();

            const dialogIframe = spectator.debugElement.query(
                By.css('[data-testId="dialog-iframe"]')
            );

            spectator.triggerEventHandler(dialogIframe, 'load', {}); // There's no way we can load the iframe, because we are setting a real src and will not load

            dialogIframe.nativeElement.contentWindow.document.dispatchEvent(
                new CustomEvent('ng-event', {
                    detail: {
                        name: NG_CUSTOM_EVENTS.SAVE_CONTENTLET,
                        payload: {
                            htmlPageReferer: '/my-awesome-page'
                        }
                    }
                })
            );
            spectator.detectChanges();

            expect(navigate).toHaveBeenCalledWith([], {
                queryParams: {
                    url: 'my-awesome-page'
                },
                queryParamsHandling: 'merge'
            });
        });

        it('should trigger a store load if the url is the same', () => {
            const loadMock = jest.spyOn(store, 'load');

            spectator.detectChanges();
            store.initActionEdit({
                inode: '123',
                title: 'hello world',
                type: 'shell'
            });
            spectator.detectChanges();

            const dialogIframe = spectator.debugElement.query(
                By.css('[data-testId="dialog-iframe"]')
            );

            spectator.triggerEventHandler(dialogIframe, 'load', {}); // There's no way we can load the iframe, because we are setting a real src and will not load

            dialogIframe.nativeElement.contentWindow.document.dispatchEvent(
                new CustomEvent('ng-event', {
                    detail: {
                        name: NG_CUSTOM_EVENTS.SAVE_CONTENTLET,
                        payload: {
                            htmlPageReferer: '/index'
                        }
                    }
                })
            );
            spectator.detectChanges();

            expect(loadMock).toHaveBeenCalledWith({
                language_id: 1,
                url: 'index',
                persona_id: DEFAULT_PERSONA.identifier
            });
        });
    });
});
