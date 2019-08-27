import { Page } from './page';


export class ReferalsModal extends Page {
    constructor(app) {
        super(app)
    }
    get referalsTable() {return this.app.getElement("//sui-modal//tbody"); }
    get referalsTableRows() {return this.app.getElements("//sui-modal//tbody//tr"); }
    get referalsTableCells() {return this.app.getElements("//sui-modal//tbody//td"); }
    get okButton() {return this.app.getElement(".green.ui.button"); }

    async getReferalsTableObject() {
        let cells = await  this.referalsTableCells;
        let response = [];
        let keys =["Email","FechaDeAlta","PerfilesNavegados","Activo"]
        let n = keys.length;


        let result = await cells.map( function (cell) {
            return cell.ELEMENT;
        })
        let y = -1;
        for(var x =0; x < result.length; ++x){
            if(x%n==0){
                response.push({});
                y++;
            }
            let text = await this.app.elementIdText(result[x]);
            response[y][keys[x%n]] = text.value;
        }
        return(response);
    }

   
}
