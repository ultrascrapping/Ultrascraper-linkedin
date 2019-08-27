import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { VersionErrorModalComponent } from './version-error-modal.component';

describe('VersionErrorModalComponent', () => {
    let component: VersionErrorModalComponent;
    let fixture: ComponentFixture<VersionErrorModalComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [VersionErrorModalComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(VersionErrorModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});