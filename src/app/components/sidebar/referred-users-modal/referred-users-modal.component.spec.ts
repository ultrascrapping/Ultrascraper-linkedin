import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReferredUsersModalComponent } from './referred-users-modal.component';

describe('ReferredUsersModalComponent', () => {
    let component: ReferredUsersModalComponent;
    let fixture: ComponentFixture<ReferredUsersModalComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ReferredUsersModalComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ReferredUsersModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});