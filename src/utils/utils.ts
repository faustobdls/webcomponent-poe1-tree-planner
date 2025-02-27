export function format(first?: string, middle?: string, last?: string): string {
  return (first || '') + (middle ? ` ${middle}` : '') + (last ? ` ${last}` : '');
}

export class utils {
    public static poecdn = "http://web.poecdn.com/";
    // https://droprate.pro/PathofExile/tree/data/skill-trees/3.25.0/SkillTree.json
    // https://droprate.pro/PathofExile/tree/data
    // https://faustobdls.github.io/webcomponent-poe1-tree-planner/assets
    public static DATA_URI = "https://droprate.pro/PathofExile/tree/data";
    public static SKILL_TREES_URI = `${utils.DATA_URI}/skill-trees`;

    public static getKeyByValue(dict: { [key: string]: any }, value: any): string | undefined {
        return Object.keys(dict).find((key: string) => { return dict[key] === value; });
    }

    public static NotUndefined<T>(x: T | undefined): x is T {
        return x !== undefined;
    }

    public static NotNullOrWhiteSpace(x: string | null | undefined): x is string | null | undefined {
        return x !== undefined && x !== null && x.trim() !== "";
    }
}