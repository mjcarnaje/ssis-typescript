class Parser {
  encode<T>(json: T): string {
    const text = Object.entries(json)
      .map(([key, value]) => `${key}=${value}`)
      .join(";");
    return `${text}|\r`;
  }

  decode(text: string): Record<string, any> {
    return text
      .split(";")
      .filter((text) => text.trim() !== "")
      .reduce((acc, text) => {
        const [key, value] = text.split("=").map((text) => text.trim());
        acc[key] = value;
        return acc;
      }, {} as Record<string, any>);
  }

  parse(text: string): Record<string, any>[] {
    return text
      .split("|")
      .filter((text) => text.trim() !== "")
      .map((text) => this.decode(text));
  }
}

export const parser = new Parser();
