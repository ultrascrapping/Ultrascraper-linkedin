import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationErrorsModalComponent } from './navigation-errors-modal.component';

describe('NavigationErrorsModalComponent', () => {
    let component: NavigationErrorsModalComponent;
    let fixture: ComponentFixture<NavigationErrorsModalComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [NavigationErrorsModalComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NavigationErrorsModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});