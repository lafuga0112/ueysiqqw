import type { Actions } from "../types/ActionsTypes";
import { CodeInMemoryInstance } from "../repositories";
import { CampaignService } from "./CampaignService";

export const getActions = async (uuid: string): Promise<Actions | null> => {
  //const { DB } = c.env

  const code = CodeInMemoryInstance.getOne(uuid);

  if (!code) return null;

  // const { actions_template } = await DB.prepare('SELECT actions_template FROM Codes WHERE uuid = ?').bind(uuid).first()

  let actions = await CampaignService.getCampaign(code.actions_template);
  // console.log(actions);
 
  return actions;
};
