class Parser {
  encode<T>(json: T): string {
    let text = "";
    Object.entries(json).forEach(([key, value]) => {
      text += `${key}=${value};`;
    });
    return `${text}|\r`;
  }

  decode(text: string): Record<string, any> {
    const json: Record<string, any> = {};
    const textArray = text.split(";");
    textArray.forEach((text) => {
      const [key, value] = text.split("=");
      json[key] = value;
    });

    return json;
  }

  clean(text: string): string {
    return text.replace(/\r/g, "").replace(/\n/g, "");
  }

  parse(text: string): Record<string, any>[] {
    return text.split("|").map(this.clean).filter(Boolean).map(this.decode);
  }
}

export const parser = new Parser();
