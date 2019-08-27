import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabClosingConfirmationModalComponent } from './tab-closing-confirmation-modal.component';

describe('TabClosingConfirmationModalComponent', () => {
  let component: TabClosingConfirmationModalComponent;
  let fixture: ComponentFixture<TabClosingConfirmationModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabClosingConfirmationModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabClosingConfirmationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
