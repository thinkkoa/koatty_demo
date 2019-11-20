/**
 * @ author: xxx
 * @ copyright: Copyright (c)
 * @ license: Apache License 2.0
 * @ version: 2019-11-14 19:31:34
 */
import { Service, Base, Value, Autowired, Logger, Helper } from "koatty";
import { App } from '../App';
import { RbacService } from "./Admin/RbacService";
import * as page from "../util/page";

interface MoInterface { rel: false; sortby: any; field: any[]; ispage: boolean; pagesize: number; page: number; }

@Service()
export class CommonService extends Base {
    app: App;

    @Value("rbac")
    private rbacConf: any;
    @Autowired()
    private rbacService: RbacService;

    /**
     * 功能及数据权限检查
     *
     * @param {string} userid
     * @param {string} path
     * @param {string} modelName
     * @param {*} map
     * @returns
     * @memberof CommonService
     */
    async authCheck(userid: string, path: string, modelName: string, map: any) {
        //检查功能权限
        if (this.rbacConf.enable_rule) {
            const flag = await this.rbacService.ruleAuth(path, userid);
            if (!flag) {
                return Promise.reject("无权限访问");
            }
        }
        //获取数据权限
        if (this.rbacConf.enable_data) {
            map = await this.rbacService.dataAuth(userid, modelName, map);
        }
        return map;
    }

    /**
     * 列表查询
     *
     * @param {*} model
     * @param {*} map
     * @param {MoInterface} mo
     * @returns
     * @memberof CommonService
     */
    list(model: any, map: any, mo: MoInterface) {
        if (mo.ispage) {
            return page.list(model, map, mo).catch((err) => {
                Logger.error(err);
                return {};
            });
        } else {
            return page.list(model, map, mo).catch((err) => {
                Logger.error(err);
                return [];
            });
        }
    }

    /**
     * 查询
     *
     * @param {*} model
     * @param {*} map
     * @param {*} id
     * @returns
     * @memberof CommonService
     */
    async info(model: any, map: any, id: any) {
        const pk = await model.getPk();
        if (Helper.isEmpty(id)) {
            return Promise.reject(`id不能为空`);
        }
        map[pk] = id;
        return model.where(map).find();
    }

    /**
     * 新增
     *
     * @param {*} model
     * @param {*} data
     * @returns
     * @memberof CommonService
     */
    async add(model: any, data: any) {
        return model.add(data).catch((e: any) => Promise.reject(e.message));
    }

    /**
     * 编辑
     *
     * @param {*} model
     * @param {*} map
     * @param {*} data
     * @returns
     * @memberof CommonService
     */
    async edit(model: any, map: any, data: any) {
        const pk = await model.getPk();
        if (Helper.isEmpty(data[pk])) {
            return Promise.reject(`${pk}不能为空`);
        }
        map[pk] = data[pk];
        return model.where(map).update(data);
    }

    /**
     * 删除
     *
     * @param {*} model
     * @param {*} map
     * @param {*} id
     * @returns
     * @memberof CommonService
     */
    async del(model: any, map: any, id: any) {
        const pk = await model.getPk();
        if (Helper.isEmpty(id)) {
            return Promise.reject(`id不能为空`);
        }
        map[pk] = id;
        return model.where(map).delete();
    }


}