import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Extractor } from '../../../models/extractor';
import { Observable, interval, Subject, Subscription } from 'rxjs';
import { takeWhile, map, switchMap, takeUntil, tap, skip, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-statusbar',
  templateUrl: './statusbar.component.html',
  styleUrls: ['./statusbar.component.css']
})
export class StatusbarComponent implements OnInit {
  @Input() extractor: Extractor;
  /**
   * Flag para mostrar el timer
   */
  showNextProfileTimer = false;

  // observable para el tiemr del nextProfile
  nextProfileTime$: Observable<number>;

  constructor() {
  }

  ngOnInit() {
    this.nextProfileTime$ = this.extractor.nextProfileTimerSubject$
      .pipe(
        tap(() => {this.showNextProfileTimer = true;}), // prende flag para mostrar el timer
        // Switchmap para crear un nuevo observable cuando cambia el subject
        switchMap((time) => {
          // empieza un interval de 1 segundo hasta que el valor sea 0
          const timer = interval(1000)
          .pipe(
            takeWhile(val => val < time), // Para cuando termina el timer
            takeUntil(this.extractor.extractingStatusSubject$  // Para si se cambia el status
              .pipe(
                skip(1) // Skip porque es BeahviorSubject y no quiero el valor por defecto.
              )
            ),
            finalize(() => this.showNextProfileTimer = false), // Accion cuando termina o error en el interval
            map((e: number) => { // Devuelve la resta entre el timer y el interval
              return time - e;
            })
          );
          return timer;
        })
      );
  }
}