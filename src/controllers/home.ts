import { Request, Response } from 'express';
import {pool} from "../../secret";

export const getSubjects = async (req: Request, res: Response) => {
    try {
        const result = await (await pool).query(`select * from subjects`);
        res.send({
            code: 200,
            data: JSON.parse(JSON.stringify(result)),
        });
    } catch (e) {
        res.send({
            code: 500,
            data: 'cant get subject data',
        });
    }
};
