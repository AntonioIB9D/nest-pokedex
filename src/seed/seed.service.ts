import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-response.interface';

@Injectable()
export class SeedService {
  private readonly axios: AxiosInstance = axios;

  /**
   * The function `executeSeed` fetches data from the PokeAPI for the first 10 Pokemon and logs their
   * names and corresponding numbers.
   * @returns The `executeSeed` function is returning an array of results from the PokeAPI, which
   * contains information about 10 Pokemon. Each result includes the name of the Pokemon and its
   * corresponding ID number.
   */
  async executeSeed() {
    const { data } = await this.axios.get<PokeResponse>(
      'https://pokeapi.co/api/v2/pokemon?limit=10',
    );
    data.results.forEach(({ name, url }) => {
      const segments = url.split('/');
      const no: number = +segments[segments.length - 2];
      console.log({ name, no });
    });

    return data.results;
  }
}
