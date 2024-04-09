import { useState } from "react";
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import pokemonNames from "../utils/pokemonNames.json";
import Pokemon from "../types/pokemonType";
import typeColors from "../utils/typeColors";
import { DamageRelationsResponseType, DamageRelationsType, DamageType } from "../types/types";

function Header() {
  const [value, setValue] = useState<string>('');
  const [pokemon, setPokemon] = useState<Pokemon | undefined>(undefined);
  const [relations, setRelations] = useState<DamageRelationsType | undefined>(undefined);

  const fetchPokemon = async (pokemonName: string) => {
    if (!pokemonName) return;
    const treatedPokemonName = pokemonName.replace(/\s/g, '-').toLocaleLowerCase();
    return fetch(`https://pokeapi.co/api/v2/pokemon/${treatedPokemonName}`)
      .then(response => response.json())
      .then((data: Pokemon) => data);
  };

  const damageRelations = async (pokemonType1: string | undefined, pokemonType2: string | undefined) => {
    if (!pokemonType1) return;
    const type1Relations: DamageRelationsType = await fetch(`https://pokeapi.co/api/v2/type/${pokemonType1}`)
      .then(response => response.json())
      .then(data => data.damage_relations)
      .then((data: DamageRelationsResponseType) => {
        return {
          double_damage_from: data.double_damage_from.map((type: DamageType) => type.name),
          half_damage_from: data.half_damage_from.map((type: DamageType) => type.name),
          no_damage_from: data.no_damage_from.map((type: DamageType) => type.name),
        };
      });
    let type2Relations: DamageRelationsType | undefined = undefined;
    if (pokemonType2) {
      type2Relations = await fetch(`https://pokeapi.co/api/v2/type/${pokemonType2}`)
        .then(response => response.json())
        .then(data => data.damage_relations)
        .then((data: DamageRelationsResponseType) => {
          return {
            double_damage_from: data.double_damage_from.map((type: DamageType) => type.name),
            half_damage_from: data.half_damage_from.map((type: DamageType) => type.name),
            no_damage_from: data.no_damage_from.map((type: DamageType) => type.name),
          };
        });
    }
    console.log(type1Relations, type2Relations);
    const newRelations: DamageRelationsType = {
      quadruple_damage_from: [],
      double_damage_from: [],
      half_damage_from: [],
      quarter_damage_from: [],
      no_damage_from: [],
    };
    if (type2Relations) {
      newRelations.quadruple_damage_from = type1Relations.double_damage_from.filter(
        type => type2Relations?.double_damage_from.includes(type));
      newRelations.quarter_damage_from = type1Relations.half_damage_from.filter(
        type => type2Relations?.half_damage_from.includes(type));
      newRelations.no_damage_from.push(
        ...type1Relations.no_damage_from, ...type2Relations.no_damage_from);
      newRelations.double_damage_from.push(...type1Relations.double_damage_from.filter(
        type => !type2Relations?.double_damage_from.includes(type)
          && !type2Relations?.no_damage_from.includes(type)
          && !type2Relations?.half_damage_from.includes(type)));
      newRelations.double_damage_from.push(...type2Relations.double_damage_from.filter(
        type => !type1Relations.double_damage_from.includes(type)
          && !type1Relations.no_damage_from.includes(type)
          && !type1Relations.half_damage_from.includes(type)));
      newRelations.half_damage_from.push(...type1Relations.half_damage_from.filter(
        type => !type2Relations?.half_damage_from.includes(type)
          && !type2Relations?.no_damage_from.includes(type)
          && !type2Relations?.double_damage_from.includes(type)));
      newRelations.half_damage_from.push(...type2Relations.half_damage_from.filter(
        type => !type1Relations.half_damage_from.includes(type)
          && !type1Relations.no_damage_from.includes(type)
          && !type1Relations.double_damage_from.includes(type)));
    } else {
      newRelations.double_damage_from = type1Relations.double_damage_from;
      newRelations.half_damage_from = type1Relations.half_damage_from;
      newRelations.no_damage_from = type1Relations.no_damage_from;
    }
    console.log(newRelations);
    return newRelations;
  };

  const getPokemon = async (pokemonName: string) => {
    const pokemonResponse = await fetchPokemon(pokemonName);
    setPokemon(pokemonResponse);
    console.log(pokemonResponse);
    const pokemonType1 = pokemonResponse?.types[0].type.name;
    const pokemonType2 = pokemonResponse?.types[1]?.type.name;
    console.log(pokemonType1, pokemonType2);
    const relationsResponse: DamageRelationsType | undefined = await damageRelations(pokemonType1, pokemonType2);
    setRelations(relationsResponse);
  };


  return (
    <div>
      <div className="max-w-sm m-4 rounded shadow-lg">
        <Autocomplete
          options={pokemonNames}
          value={value}
          isOptionEqualToValue={(option, value) => value ? option === value : true}
          onChange={(_, newValue) => {
            setValue(newValue || "");
            getPokemon(newValue || "");
          }}
          renderInput={(params) => <TextField {...params} label="Pokemon" variant="outlined" />}
        />
        {pokemon && (
          <div className="flex">
            <div className="inline-block">
              <div className="flex justify-center">
                <img className="w-50" src={pokemon.sprites.front_default} alt={pokemon.name} />
              </div>
              <div className="flex justify-center px-6 pt-4 pb-2">
                <span
                  className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
                  style={{ backgroundColor: typeColors()[pokemon.types[0].type.name] }}
                >
                  {pokemon.types[0].type.name}
                </span>
                {pokemon.types[1] &&
                  <span
                    className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
                    style={{ backgroundColor: typeColors()[pokemon.types[1].type.name] }}
                  >
                    {pokemon.types[1].type.name}
                  </span>
                }
              </div>
            </div>
            <div className="inline-block">
              {relations && (
                <div className="flex flex-col justify-center">
                  {relations.quadruple_damage_from && relations.quadruple_damage_from.length > 0 ? (
                    <div className="flex flex-col">
                      <div className="flex justify-center">
                        <span className="text-l font-semibold">Quadruple Damage From</span>
                      </div>
                      <div className="flex justify-center">
                        {relations.quadruple_damage_from?.map((type, index) => (
                          <span
                            key={index}
                            className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
                            style={{ backgroundColor: typeColors()[type] }}
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {relations.double_damage_from && relations.double_damage_from.length > 0 ? (
                    <div className="flex flex-col">
                      <div className="flex justify-center">
                        <span className="text-l font-semibold">Double Damage From</span>
                      </div>
                      <div className="flex justify-center">
                        {relations.double_damage_from.map((type, index) => (
                          <span
                            key={index}
                            className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
                            style={{ backgroundColor: typeColors()[type] }}
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {relations.half_damage_from && relations.half_damage_from.length > 0 ? (
                    <div className="flex flex-col">
                      <div className="flex justify-center">
                        <span className="text-l font-semibold">Half Damage From</span>
                      </div>
                      <div className="flex justify-center">
                        {relations.half_damage_from.map((type, index) => (
                          <span
                            key={index}
                            className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
                            style={{ backgroundColor: typeColors()[type] }}
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {relations.quarter_damage_from && relations.quarter_damage_from.length > 0 ? (
                    <div className="flex flex-col">
                      <div className="flex justify-center">
                        <span className="text-l font-semibold">Quarter Damage From</span>
                      </div>
                      <div className="flex justify-center">
                        {relations.quarter_damage_from.map((type, index) => (
                          <span
                            key={index}
                            className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
                            style={{ backgroundColor: typeColors()[type] }}
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {relations.no_damage_from && relations.no_damage_from.length > 0 ? (
                    <div className="flex flex-col">
                      <div className="flex justify-center">
                        <span className="text-l font-semibold">No Damage From</span>
                      </div>
                      <div className="flex justify-center">
                        {relations.no_damage_from.map((type, index) => (
                          <span
                            key={index}
                            className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
                            style={{ backgroundColor: typeColors()[type] }}
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Header;