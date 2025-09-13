import { HardhatError } from "@nomicfoundation/hardhat-errors";
import { findClosestPackageRoot } from "@nomicfoundation/hardhat-utils/package";
import { resolveFromRoot } from "@nomicfoundation/hardhat-utils/path";
import { validateUserConfig } from "./config-validation.js";
import { resolveConfigurationVariable } from "./configuration-variables.js";
import { buildGlobalOptionDefinitions, resolveGlobalOptions, } from "./global-options.js";
import { HookManagerImplementation } from "./hook-manager.js";
import { resolvePluginList } from "./plugins/resolve-plugin-list.js";
import { TaskManagerImplementation } from "./tasks/task-manager.js";
import { UserInterruptionManagerImplementation } from "./user-interruptions.js";
export class HardhatRuntimeEnvironmentImplementation {
    userConfig;
    config;
    hooks;
    interruptions;
    globalOptions;
    // NOTE: This is a small architectural violation, as these shouldn't be needed
    // here, because they are added by plugins. But as those plugins are builtin,
    // their type extensions also affect this module.
    network;
    artifacts;
    solidity;
    // NOTE: This is slight architectural violation, as this is intended for the
    // internal use only. It is set up by the coverage plugin in the `created` hook.
    _coverage;
    static async create(inputUserConfig, userProvidedGlobalOptions, projectRoot, unsafeOptions) {
        const resolvedProjectRoot = await resolveProjectRoot(projectRoot);
        const resolvedPlugins = unsafeOptions?.resolvedPlugins ??
            (await resolvePluginList(resolvedProjectRoot, inputUserConfig.plugins));
        const hooks = new HookManagerImplementation(resolvedProjectRoot, resolvedPlugins);
        // extend user config:
        const extendedUserConfig = await runUserConfigExtensions(hooks, inputUserConfig);
        // validate config
        const userConfigValidationErrors = await validateUserConfig(hooks, extendedUserConfig);
        if (userConfigValidationErrors.length > 0) {
            throw new HardhatError(HardhatError.ERRORS.CORE.GENERAL.INVALID_CONFIG, {
                errors: `\t${userConfigValidationErrors
                    .map((error) => `* Config error in config.${error.path.join(".")}: ${error.message}`)
                    .join("\n\t")}`,
            });
        }
        // Resolve config
        const resolvedConfig = await resolveUserConfig(resolvedProjectRoot, userProvidedGlobalOptions.config, hooks, resolvedPlugins, extendedUserConfig);
        // We override the plugins and the project root, as we want to prevent
        // the plugins from changing them
        const config = {
            ...resolvedConfig,
            paths: {
                ...resolvedConfig.paths,
                root: resolvedProjectRoot,
            },
            plugins: resolvedPlugins,
        };
        const globalOptionDefinitions = unsafeOptions?.globalOptionDefinitions ??
            buildGlobalOptionDefinitions(resolvedPlugins);
        const globalOptions = resolveGlobalOptions(userProvidedGlobalOptions, globalOptionDefinitions);
        // Set the HookContext in the hook manager so that non-config hooks can
        // use it
        const interruptions = new UserInterruptionManagerImplementation(hooks);
        const hre = new HardhatRuntimeEnvironmentImplementation(extendedUserConfig, config, hooks, interruptions, globalOptions, globalOptionDefinitions);
        // We create an object with the HRE as its prototype, and overwrite the
        // tasks property with undefined, so that hooks don't have access to the
        // task runner.
        //
        // The reason we do this with a prototype instead of a shallow copy is that
        // the handlers hooked into hre/created may assign new properties to the
        // HRE and we want those to be accessible to all the handlers.
        const hookContext = Object.create(hre, {
            tasks: { value: undefined },
        });
        hooks.setContext(hookContext);
        await hooks.runSequentialHandlers("hre", "created", [hre]);
        return hre;
    }
    tasks;
    constructor(userConfig, config, hooks, interruptions, globalOptions, globalOptionDefinitions) {
        this.userConfig = userConfig;
        this.config = config;
        this.hooks = hooks;
        this.interruptions = interruptions;
        this.globalOptions = globalOptions;
        this.tasks = new TaskManagerImplementation(this, globalOptionDefinitions);
    }
}
/**
 * Resolves the project root of a Hardhat project based on the config file or
 * another path within the project. If not provided, it will be resolved from
 * the current working directory.
 *
 * @param absolutePathWithinProject An absolute path within the project, usually
 * the config file.
 */
export async function resolveProjectRoot(absolutePathWithinProject) {
    return findClosestPackageRoot(absolutePathWithinProject ?? process.cwd());
}
async function runUserConfigExtensions(hooks, config) {
    return hooks.runHandlerChain("config", "extendUserConfig", [config], async (c) => {
        return c;
    });
}
async function resolveUserConfig(projectRoot, configPath, hooks, sortedPlugins, config) {
    /* eslint-disable-next-line @typescript-eslint/consistent-type-assertions --
    The config resolution is type-unsafe, as plugins augment the HardhatConfig
    type. This means that: (1) we can't fully initialize a valid HardhatConfig
    here, and (2) when writing a hook handler, the value returned by next() is
    probably invalid with respect to your own augmentations. */
    const initialResolvedConfig = {
        plugins: sortedPlugins,
        tasks: config.tasks ?? [],
        paths: resolvePaths(projectRoot, configPath, config.paths),
    };
    return hooks.runHandlerChain("config", "resolveUserConfig", [config, (variable) => resolveConfigurationVariable(hooks, variable)], async (_, __) => {
        return initialResolvedConfig;
    });
}
function resolvePaths(projectRoot, configPath, userProvidedPaths = {}) {
    return {
        root: projectRoot,
        config: configPath !== undefined
            ? resolveFromRoot(projectRoot, configPath)
            : undefined,
        cache: resolveFromRoot(projectRoot, userProvidedPaths.cache ?? "cache"),
        artifacts: resolveFromRoot(projectRoot, userProvidedPaths.artifacts ?? "artifacts"),
        /* eslint-disable-next-line @typescript-eslint/consistent-type-assertions --
        We cast as the builtin plugins' type extensions are also applied here,
        making an empty object incompatible, but it's the correct value when you
        ignore the plugins. */
        tests: {},
        /* eslint-disable-next-line @typescript-eslint/consistent-type-assertions --
        See the comment in tests. */
        sources: {},
    };
}
//# sourceMappingURL=hre.js.map