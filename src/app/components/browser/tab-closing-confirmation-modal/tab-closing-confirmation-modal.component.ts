import { Component, OnInit } from '@angular/core';
import { SuiModal, ComponentModalConfig } from 'ng2-semantic-ui';

interface ITabClosingConfirmationModalContext { }

@Component({
  selector: 'app-tab-closing-confirmation-modal',
  templateUrl: './tab-closing-confirmation-modal.component.html',
  styleUrls: ['./tab-closing-confirmation-modal.component.css']
})
export class TabClosingConfirmationModalComponent implements OnInit {

  constructor(public modal: SuiModal<ITabClosingConfirmationModalContext, void, void>) { }

  ngOnInit() { }

}

export class TabClosingConfirmationModal extends ComponentModalConfig<ITabClosingConfirmationModalContext, void, void> {
  constructor() {
      super(TabClosingConfirmationModalComponent, {});
      this.isClosable = false;
  }
}
