export class Config {
	private static readonly VERBOSE_TRUE_FIELDS = ["1", "y", "yes", "true", "on"];

	public static isDevMode(): boolean {
		return this.VERBOSE_TRUE_FIELDS.includes(
			process.env.OPENSLIDES_DEVELOPMENT || ""
		);
	}
}
