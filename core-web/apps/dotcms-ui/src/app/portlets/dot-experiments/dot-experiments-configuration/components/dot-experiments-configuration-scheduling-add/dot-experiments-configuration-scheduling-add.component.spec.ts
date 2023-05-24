import {
    byTestId,
    createComponentFactory,
    mockProvider,
    Spectator,
    SpyObject
} from '@ngneat/spectator';
import { of } from 'rxjs';

import { ActivatedRoute } from '@angular/router';

import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Calendar } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { Sidebar } from 'primeng/sidebar';

import { DotMessageService } from '@dotcms/data-access';
import { ExperimentSteps, TIME_90_DAYS } from '@dotcms/dotcms-models';
import { MockDotMessageService } from '@dotcms/utils-testing';
import { DotExperimentsConfigurationStore } from '@portlets/dot-experiments/dot-experiments-configuration/store/dot-experiments-configuration-store';
import { DotExperimentsService } from '@portlets/dot-experiments/shared/services/dot-experiments.service';
import { ACTIVE_ROUTE_MOCK_CONFIG, getExperimentMock } from '@portlets/dot-experiments/test/mocks';
import { DotHttpErrorManagerService } from '@services/dot-http-error-manager/dot-http-error-manager.service';

import { DotExperimentsConfigurationSchedulingAddComponent } from './dot-experiments-configuration-scheduling-add.component';

const messageServiceMock = new MockDotMessageService({
    Done: 'Done',
    'experiments.configure.scheduling.start.time': 'Start Time',
    'experiments.configure.scheduling.end.time': 'End Time',
    'experiments.configure.scheduling.name': 'Scheduling'
});

const EXPERIMENT_MOCK = { ...getExperimentMock(0), scheduling: { startDate: 1, endDate: 12196e5 } };

describe('DotExperimentsConfigurationSchedulingAddComponent', () => {
    let spectator: Spectator<DotExperimentsConfigurationSchedulingAddComponent>;
    let store: DotExperimentsConfigurationStore;
    let dotExperimentsService: SpyObject<DotExperimentsService>;
    let sidebar: Sidebar;

    const createComponent = createComponentFactory({
        imports: [ButtonModule, CardModule],
        component: DotExperimentsConfigurationSchedulingAddComponent,
        componentProviders: [],
        providers: [
            DotExperimentsConfigurationStore,
            mockProvider(DotExperimentsService),
            mockProvider(MessageService),
            mockProvider(DotHttpErrorManagerService),
            mockProvider(ActivatedRoute, ACTIVE_ROUTE_MOCK_CONFIG),
            {
                provide: DotMessageService,
                useValue: messageServiceMock
            }
        ]
    });

    beforeEach(async () => {
        spectator = createComponent({
            detectChanges: false
        });

        store = spectator.inject(DotExperimentsConfigurationStore);
        dotExperimentsService = spectator.inject(DotExperimentsService);
        dotExperimentsService.getById.and.returnValue(of(EXPERIMENT_MOCK));

        store.loadExperiment(EXPERIMENT_MOCK.id);
        store.setSidebarStatus({
            experimentStep: ExperimentSteps.SCHEDULING,
            isOpen: true
        });
        spectator.detectChanges();
    });

    it('should load scheduling current values', () => {
        const startDateCalendar: Calendar = spectator.query(Calendar);
        const endDateCalendar: Calendar = spectator.queryLast(Calendar);

        expect(startDateCalendar.value.getTime()).toEqual(EXPERIMENT_MOCK.scheduling.startDate);
        expect(endDateCalendar.value.getTime()).toEqual(EXPERIMENT_MOCK.scheduling.endDate);
    });

    it('should have set the props correctly', () => {
        const startDateCalendar: Calendar = spectator.query(Calendar);
        const endDateCalendar: Calendar = spectator.queryLast(Calendar);

        expect(startDateCalendar.stepMinute).toEqual(30);
        expect(startDateCalendar.readonlyInput).toEqual(true);
        expect(startDateCalendar.showIcon).toEqual(true);
        expect(startDateCalendar.showClear).toEqual(true);

        expect(endDateCalendar.stepMinute).toEqual(30);
        expect(endDateCalendar.readonlyInput).toEqual(true);
        expect(endDateCalendar.showIcon).toEqual(true);
        expect(endDateCalendar.showClear).toEqual(true);
    });

    it('should save form when is valid', () => {
        spyOn(store, 'setSelectedScheduling');
        const submitButton = spectator.query(
            byTestId('add-scheduling-button')
        ) as HTMLButtonElement;

        expect(submitButton.disabled).toBeFalse();
        expect(submitButton).toContainText('Done');
        expect(spectator.component.form.valid).toBeTrue();

        spectator.click(submitButton);
        expect(store.setSelectedScheduling).toHaveBeenCalledWith({
            scheduling: EXPERIMENT_MOCK.scheduling,
            experimentId: EXPERIMENT_MOCK.id
        });
    });

    it('should set min dates correctly', () => {
        const startDateCalendar: Calendar = spectator.query(Calendar);
        const endDateCalendar: Calendar = spectator.queryLast(Calendar);

        const component = spectator.component;
        const mockDate = new Date(1682099633467);
        const time5days = 432e6; // value set in the ActiveRouteMock
        const mockMinEndDate = 1682099633467 + time5days;
        jasmine.clock().install();
        jasmine.clock().mockDate(mockDate);

        component.form.get('startDate').setValue(new Date());
        startDateCalendar.onSelect.emit();

        spectator.detectChanges();

        expect(endDateCalendar.minDate.getTime()).toEqual(mockMinEndDate);
        expect(endDateCalendar.defaultDate.getTime()).toEqual(mockMinEndDate);

        jasmine.clock().uninstall();
    });

    it('should clear end date if start date is equal or more', () => {
        const startDateCalendar: Calendar = spectator.query(Calendar);

        const component = spectator.component;
        const mockDate = new Date(16820996334200);
        jasmine.clock().install();
        jasmine.clock().mockDate(mockDate);

        component.form.get('startDate').setValue(new Date());
        component.form.get('endDate').setValue(new Date());
        startDateCalendar.onSelect.emit();

        spectator.detectChanges();

        expect(component.form.get('endDate').value).toEqual(null);

        jasmine.clock().uninstall();
    });

    it('max end date date should be 90 days', () => {
        const startDateCalendar: Calendar = spectator.query(Calendar);

        const component = spectator.component;
        const mockDate = new Date(16820996334200);
        // Default vale of 90 because max end date is not defined in the Active Route
        const expectedEndDate = new Date(16820996334200 + TIME_90_DAYS);
        jasmine.clock().install();
        jasmine.clock().mockDate(mockDate);

        component.form.get('startDate').setValue(new Date());
        startDateCalendar.onSelect.emit();

        spectator.detectChanges();

        expect(component.maxEndDate).toEqual(expectedEndDate);

        jasmine.clock().uninstall();
    });

    it('should close sidebar', () => {
        spyOn(store, 'closeSidebar');
        sidebar = spectator.query(Sidebar);
        sidebar.hide();

        expect(store.closeSidebar).toHaveBeenCalledTimes(1);
    });
});
