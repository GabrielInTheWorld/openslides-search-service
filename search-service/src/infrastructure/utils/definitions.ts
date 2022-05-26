export interface SearchServiceResponse<T = unknown> {
	results: T[];
	message: string;
	success: boolean;
}
