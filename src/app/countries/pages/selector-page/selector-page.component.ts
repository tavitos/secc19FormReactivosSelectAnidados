import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { filter, switchMap, tap } from 'rxjs';

import { CountriesService } from '../../services/countries.service';
import { Region, SmallCountry } from '../../interfaces/country.interfaces';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
  styles: [
  ]
})
export class SelectorPageComponent implements OnInit {

  public countriesByRegion: SmallCountry[] = [];
  // public borders: string[] = [];
  public borders: SmallCountry[] = [];

  public myForm: FormGroup = this.fb.group({
    region : ['', Validators.required],
    country: ['', Validators.required],
    border : ['', Validators.required]
  });

  constructor(
    private fb:FormBuilder,
    private countriesService: CountriesService
  ) { }

  get regions(): Region[] {
    return this.countriesService.regions; /** Apunta por referencia a regiones, es el getter en el servicio. */
  }

  ngOnInit(): void {
    this.onRegionChanged();
    this.onCountryChanged();
  }

  onRegionChanged(): void{
    this.myForm.get('region')!.valueChanges
    .pipe(
      tap( () => this.myForm.get('country')!.setValue('') ), /** Operador de efecto secundario, envia al campo country vacío el cual apunta a la opción -- Seleccione País -- */
      tap( () => this.borders = [] ), 
      // El operador switchMap recibe el valor de un Observable y se suscribe a otro Observable 
      switchMap( (region) => this.countriesService.getCountriesByRegion(region) ) /** La region es el valor anterior  */
      // switchMap( this.countriesService.getCountriesByRegion ) /** Lo mismo que arriba */
    )
    // .subscribe( value => {
    .subscribe( countries => {
      // console.log({ region: value }); /** o en su caso lo que esta abajo */
      // console.log({ countries }); 
      this.countriesByRegion = countries;
    });
  }

  onCountryChanged(): void {
    this.myForm.get('country')!.valueChanges
    .pipe(
      tap( () => this.myForm.get('border')!.setValue('') ), 
      filter( (value: string) => value.length > 0 ),
      switchMap( (alphaCode) => this.countriesService.getCountryByAlphaCode(alphaCode) ),
      switchMap( (country) => this.countriesService.getCountryBordersByCodes( country.borders) )
    )
    .subscribe( countries => {
      // console.log({ borders: country.borders });
      this.borders = countries;
    });
  }

}
