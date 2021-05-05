/*
 * GET home page.
 */
import * as EX from 'express';
const router = EX.Router();

router.get('/', (req: EX.Request, res: EX.Response) => {
    res.render('index', { title: 'Express' });
});

export const RootRouter = router;
