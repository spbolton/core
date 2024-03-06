import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PaginatorModule } from 'primeng/paginator';

import { DotPaletteContentletsComponent } from '@dotcms/app/portlets/dot-edit-page/components/dot-palette/dot-palette-contentlets/dot-palette-contentlets.component';
import { DotMessagePipe, DotSafeHtmlPipe, DotSpinnerModule } from '@dotcms/ui';

import { DotPaletteInputFilterModule } from '../dot-palette-input-filter/dot-palette-input-filter.module';

@NgModule({
    imports: [
        CommonModule,
        DotSafeHtmlPipe,
        DotPaletteInputFilterModule,
        PaginatorModule,
        DotSpinnerModule,
        DotMessagePipe
    ],
    declarations: [DotPaletteContentletsComponent],
    exports: [DotPaletteContentletsComponent]
})
export class DotPaletteContentletsModule {}
