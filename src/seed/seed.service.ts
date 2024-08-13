import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { PokeResponse } from './interfaces/poke-response.interface';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Pokemon.name) private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter,
  ) {}

  /**
   * The function `executeSeed` fetches data from the PokeAPI for the first 10 Pokemon and logs their
   * names and corresponding numbers.
   * @returns The `executeSeed` function is returning an array of results from the PokeAPI, which
   * contains information about 10 Pokemon. Each result includes the name of the Pokemon and its
   * corresponding ID number.
   */
  async executeSeed() {
    /*Cada que se ejecute el seed se borraran los registros */
    await this.pokemonModel.deleteMany({});

    const data = await this.http.get<PokeResponse>(
      'https://pokeapi.co/api/v2/pokemon?limit=650',
    );

    const pokemonToInsert: { name: string; no: number }[] = [];

    data.results.forEach(({ name, url }) => {
      const segments = url.split('/');
      const no: number = +segments[segments.length - 2];
      /* await this.pokemonModel.create({
        name,
        no,
      }); */
      pokemonToInsert.push({ name, no });
    });

    /* Crea una inserción con muchas entradas */
    await this.pokemonModel.insertMany(pokemonToInsert);

    return 'Seed Executed';
  }
}
