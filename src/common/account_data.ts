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

export interface WhitelistStatus {
	timestamp: number;
	count: number;
	status: string;
}

let data: ForumAccountInfo | null = null;
let wl_data: WhitelistStatus | null = null;

export default {
	setData: (_data: ForumAccountInfo) => {
		data = _data;
	},
	getData: () => {
		return data;
	},

	clearData: () => {
		data = null;
		wl_data = null;
	},

	setWlStatus: (_wl_data: WhitelistStatus) => {
		wl_data = _wl_data;
	},
	getWlStatus: () => {
		return wl_data;
	}
}