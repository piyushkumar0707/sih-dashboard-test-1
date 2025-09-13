import { isObject } from "../lang.js";
let clone = null;
export async function getDeepCloneFunction() {
    const { default: rfdc } = await import("rfdc");
    if (clone === null) {
        clone = rfdc();
    }
    return clone;
}
export function deepMergeImpl(target, source) {
    /* eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    -- The result is expected to include properties from both target and source,
    but initially only target is spread in, so a cast is needed. */
    const result = { ...target };
    /*  eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    -- TypeScript cannot infer the correct union of string and symbol keys, but all keys come from U */
    const keys = [
        ...Object.keys(source),
        ...Object.getOwnPropertySymbols(source),
    ];
    for (const key of keys) {
        if (isObject(source[key]) &&
            // Only merge recursively objects that are not class instances
            Object.getPrototypeOf(source[key]) === Object.prototype) {
            /* eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            -- The call signature expects the second argument to be of type U; the type is correct, but TypeScript can't infer it here. */
            result[key] = deepMergeImpl(result[key] ?? {}, source[key]);
        }
        else {
            /* eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            --  Cast required because TypeScript can't guarantee that a dynamic key from `U` exists in `T & U` or has the correct value type. */
            result[key] = source[key];
        }
    }
    return result;
}
//# sourceMappingURL=lang.js.map