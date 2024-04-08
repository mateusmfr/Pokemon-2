import { useState } from "react";
import { AutoComplete, AutoCompleteCompleteEvent } from "primereact/autocomplete";
import { Button } from "primereact/button";
import pokemonNames from "../utils/pokemonNames.json";
import pokeIcon from "../assets/pokeIcon.png";
import Pokemon from "../types/pokemonType";

function Header() {
  const [value, setValue] = useState<string>('');
  const [items, setItems] = useState<string[]>([]);
  const [pokemon, setPokemon] = useState<Pokemon | undefined>(undefined);

  const search = (event: AutoCompleteCompleteEvent) => {
    const results = pokemonNames.filter((name: string) =>
      name.toLowerCase().startsWith(event.query.toLowerCase())
    );
    setItems(results);
  };

  const fetchPokemon = async () => {
    if (!value) return;
    return fetch(`https://pokeapi.co/api/v2/pokemon/${value.toLocaleLowerCase()}`)
    .then(response => response.json())
    .then((data: Pokemon) => data);
  };

  const getPokemon = async () => {
    const pokemonResponse = await fetchPokemon();
    setPokemon(pokemonResponse);
  };

  return (
    <>
      <div>
        <AutoComplete value={value} suggestions={items} completeMethod={search} onChange={(e) => setValue(e.value)} forceSelection/>
        <Button onClick={getPokemon}>
          <img src={pokeIcon} alt="pokeIcon" style={{width: '15px', height: '15px'}}/>
        </Button>
      </div>
      <div>
      {pokemon && (
      <div>
        <h1>{pokemon.name}</h1>
        <img src={pokemon.sprites.front_default} alt={pokemon.name} />
      </div>
    )}
      </div>
    </>
  );
}

export default Header;