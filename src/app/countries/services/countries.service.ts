import { Injectable } from '@angular/core';
import { Country, Region, SmallCountry } from '../interfaces/country.interfaces';
import { Observable, combineLatest, map, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http'; /** para utilizar éste, hay que importar 
                                                    /* en app.module el HttpClientModule */

@Injectable({
  providedIn: 'root'
})
export class CountriesService {

  private baseUrl: string = 'https://restcountries.com/v3.1';

  private _regions: Region[] = [Region.Africa, Region.Americas, Region.Asia, Region.Europe, Region.Oceania];

  constructor(
    private http: HttpClient
  ) { }

  get regions(): Region[] { /** <-- getter que devuelce un array de tipo Region */
    return [...this._regions]; /** Con el operador spread se rompe el arreglo _regions para no modificar el arreglo original */
  }

  getCountriesByRegion( region: Region): Observable<SmallCountry[]> {
    if( !region ) return of([]);

    const url: string = `${this.baseUrl}/region/${region}?fields=cca3,name,borders`;

    return this.http.get<Country[]>(url)
      .pipe(
        // map( countries => [] ), /** Transforma la info que fluye a través de él en otra cosa, en este caso retorna un arreglo vacío */
        map( countries => countries.map( country => ({
          name: country.name.common,
          cca3: country.cca3,
          borders: country.borders ?? [] /** operador de covalencia nula (??), si country.borders es nulo entonces lo regresa */
        })) ), 
        // tap( response => console.log({ response }))
      );
  }

  getCountryByAlphaCode( alphaCode: string ): Observable<SmallCountry>{
    // console.log({ alphaCode });
    
    const url: string = `${ this.baseUrl }/alpha/${alphaCode}?fields=cca3,name,borders`;
    return this.http.get<Country>( url )
    .pipe(
      map( country => ({
        name: country.name.common,
        cca3: country.cca3,
        borders: country.borders ?? []
      }))
    )
  }

  getCountryBordersByCodes( borders: string[] ): Observable<SmallCountry[]> {
    if( !borders || borders.length === 0 ) return of([]);

    const countriesRequest: Observable<SmallCountry>[] = [];

    borders.forEach( code => {
      const request = this.getCountryByAlphaCode( code );
      countriesRequest.push(request);
    });

    return combineLatest( countriesRequest )
  }

}
