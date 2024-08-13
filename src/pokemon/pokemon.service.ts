import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';

import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { PaginationDto } from 'src/common/dto/Pagination.dto';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name) private readonly pokemonModel: Model<Pokemon>,
  ) {}

  /* Crear data */
  /**
   * The function creates a new Pokemon by converting the name to lowercase and saving it to the
   * database.
   * @param {CreatePokemonDto} createPokemonDto - The `createPokemonDto` parameter is an object that
   * contains the data needed to create a new Pokemon. It likely includes properties such as `name`,
   * `type`, `abilities`, `stats`, etc. In the provided code snippet, the `name` property of the
   * `createPokemonDto` object
   * @returns The `create` function is returning the created `pokemon` object if the creation is
   * successful. If there is an error during the creation process, the function will call
   * `this.handleExceptions(error)` but it does not return anything in that case.
   */
  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);

      return pokemon;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  /* Buscar todo */
  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return this.pokemonModel.find().limit(limit).skip(offset).sort({
      no: 1,
    });
  }

  /* Buscar por Id */
  /**
   * The function `findOne` in TypeScript searches for a Pokemon by ID, MongoID, or name in a MongoDB
   * collection and returns the corresponding Pokemon object.
   * @param {string} id - The `findOne` function you provided is an asynchronous function that attempts
   * to find a Pokemon based on the `id` parameter. The `id` parameter can be a string representing
   * either a number, a MongoDB ObjectId, or a Pokemon name.
   * @returns The `findOne` method returns a `Pokemon` object based on the provided `id`. It first
   * checks if the `id` is a number and searches for a Pokemon with a matching `no` field in the
   * database. If not found, it then checks if the `id` is a valid MongoId and searches for a Pokemon
   * with a matching `_id` field. If still not found,
   */
  async findOne(id: string) {
    let pokemon: Pokemon;

    /* Si el id es un número */
    if (!isNaN(+id)) {
      pokemon = await this.pokemonModel.findOne({ no: id });
    }

    /* Si el id es un MongoId */
    if (!pokemon && isValidObjectId(id)) {
      pokemon = await this.pokemonModel.findById(id);
    }

    /* Si el name existe */
    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({
        name: id.toLowerCase().trim(),
      });
    }

    /* Si no existe en la BD */
    if (!pokemon)
      throw new NotFoundException(
        `Pokemon with id, name or N.O. "${id}" not found`,
      );

    return pokemon;
  }

  /**
   * This TypeScript function updates a Pokemon entity with the provided data after converting the name
   * to lowercase if it exists.
   * @param {string} id - The `id` parameter in the `update` function is a string that represents the
   * unique identifier of the Pokemon that you want to update.
   * @param {UpdatePokemonDto} updatePokemonDto - The `updatePokemonDto` parameter is an object that
   * contains the updated information for a Pokemon. It may include properties such as `name`, `type`,
   * `level`, `abilities`, etc. In the provided code snippet, if the `name` property is present in the
   * `updatePokemonDto`,
   * @returns The `update` function is returning an object that combines the original `pokemon` data
   * after converting the name to lowercase (if `updatePokemonDto.name` exists) and the updated fields
   * from `updatePokemonDto`.
   */
  async update(id: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(id);

    if (updatePokemonDto.name) {
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();
    }

    try {
      await pokemon.updateOne(updatePokemonDto);
      return {
        ...pokemon.toJSON(),
        ...updatePokemonDto,
      };
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  /**
   * The function removes a Pokemon document from the database by its ID and throws an error if the
   * Pokemon is not found.
   * @param {string} id - The `remove` function takes an `id` parameter, which is a string representing
   * the unique identifier of the Pokemon that needs to be removed from the database.
   * @returns The `remove` function is returning nothing (`undefined`).
   */
  async remove(id: string) {
    /* const pokemon = await this.findOne(id);

    await pokemon.deleteOne(); */
    /* return { id }; */
    /*  const result = await this.pokemonModel.findByIdAndDelete(id); */
    const { deletedCount } = await this.pokemonModel.deleteOne({
      _id: id,
    });

    if (deletedCount === 0) {
      throw new BadRequestException(`Pokemon with id "${id}" not found`);
    }

    return;
  }

  /**
   * The function `handleExceptions` handles errors by checking for specific error codes and throwing
   * corresponding exceptions.
   * @param {any} error - The `error` parameter in the `handleExceptions` function is used to capture
   * any error that occurs during the execution of the function. The function then checks the error code
   * to determine the type of error and handles it accordingly. If the error code is 11000, it throws a
   * `BadRequestException
   */
  private handleExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(
        `Pokemon exists in db ${JSON.stringify(error.keyValue)}`,
      );
    }
    console.log(error);
    throw new InternalServerErrorException(
      `Can't create Pokemon - Check server logs`,
    );
  }
}
