import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MyAccountDataModalComponent } from './my-account-data-modal.component';

describe('MyAccountDataModalComponent', () => {
    let component: MyAccountDataModalComponent;
    let fixture: ComponentFixture<MyAccountDataModalComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MyAccountDataModalComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MyAccountDataModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});