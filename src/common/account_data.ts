export interface ForumAccountInfo {
	access: boolean;
	avatar: string;//link
	banned: boolean;
	email: string;
	group_main: number;
	groups: number[];
	id: number;
	name: string;//user nickname
	status: boolean;
}

let data: ForumAccountInfo | null = null;

export default {
	setData: (_data: ForumAccountInfo) => {
		data = _data;
	},
	getData: () => {
		return data;
	}
}