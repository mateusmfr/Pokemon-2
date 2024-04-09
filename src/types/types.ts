export interface ColorsType {
    [key: string]: string;
}

export interface DamageType {
    name: string;
    url: string;
}

export interface DamageRelationsResponseType {
    double_damage_from: DamageType[];
    half_damage_from: DamageType[];
    no_damage_from: DamageType[];
}

export interface DamageRelationsType {
    quadruple_damage_from?: string[];
    double_damage_from: string[];
    half_damage_from: string[];
    quarter_damage_from?: string[];
    no_damage_from: string[];
}

export default DamageRelationsType;