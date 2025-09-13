type PackageManager = "npm" | "yarn" | "pnpm";
/**
 * getPackageManager returns the name of the package manager used in the workspace.
 * It determines this by checking the presence of package manager specific lock files.
 *
 * @param workspace The path to the workspace where the package manager should be checked.
 * @returns The name of the package manager used in the workspace.
 */
export declare function getPackageManager(workspace: string): Promise<PackageManager>;
/**
 * getDevDependenciesInstallationCommand returns the command to install the given dependencies
 * as dev dependencies using the given package manager. The returned command should
 * be safe to run on the command line.
 *
 * @param packageManager The package manager to use.
 * @param dependencies The dependencies to install.
 * @returns The installation command.
 */
export declare function getDevDependenciesInstallationCommand(packageManager: PackageManager, dependencies: string[]): string[];
/**
 * installsPeerDependenciesByDefault returns true if the package manager
 * installs peer dependencies by default.
 *
 * @param workspace The path to the workspace where the package manager will operate.
 * @param packageManager The package manager to use.
 * @param version The version of the package manager to use. This parameter is used only for testing.
 * @param config The configuration of the package manager to use. This parameter is used only for testing.
 * @returns True if the package manager installs peer dependencies by default, false otherwise.
 */
export declare function installsPeerDependenciesByDefault(workspace: string, packageManager: PackageManager, version?: string, config?: Record<string, string>): Promise<boolean>;
export {};
//# sourceMappingURL=package-manager.d.ts.map