interface Code {
  uuid: string;
  send_otp: string;
  code: string;
  state: string;
  actions_template: string;
  created_at: Date;
}

class CodeInMemoryRepository {
  private codes: Map<string, Code> = new Map();

  constructor() {
    setInterval(() => this.removeOldCodes(), 60 * 1000);
  }

  getOne(uuid: string): Code | null {
    return this.codes.get(uuid) || null;
  }

  saveOne(
    uuid: string,
    send_otp: string,
    code: string,
    state: string,
    actions_template: string
  ): Code {
    const newCode: Code = {
      uuid,
      send_otp,
      code,
      state,
      actions_template,
      created_at: new Date(),
    };
    this.codes.set(newCode.uuid, newCode);
    return newCode;
  }

  updateOne(
    uuid: string,
    updates: Partial<Omit<Code, "uuid" | "createdAt">>
  ): Code | null {
    const code = this.getOne(uuid);
    if (!code) {
      return null;
    }
    // Actualizamos solo las propiedades que están presentes en 'updates'
    Object.assign(code, updates);
    this.codes.set(uuid, code);
    return code;
  }

  deleteOne(uuid:string){
    this.codes.delete(uuid);
  }

  private removeOldCodes(): void {
    const now = new Date();
    for (const [id, code] of this.codes) {
      const ageInMinutes =
        (now.getTime() - code.created_at.getTime()) / (1000 * 60);
      if (ageInMinutes > 15) {
        this.deleteOne(id);
      }
    }
  }
}





export const CodeInMemoryInstance = new CodeInMemoryRepository();
