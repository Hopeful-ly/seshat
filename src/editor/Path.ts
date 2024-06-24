export default class Path {
  constructor(private path: string) {}

  back() {
    const newPath = new Path(this.path.slice(0, this.path.lastIndexOf(".")));
    console.log("Went back!", this.path.toString(), "to", newPath.toString());
    return newPath;
  }
  forward(key: string | number) {
    return new Path(`${this.path}.${key}`);
  }
  children() {
    return this.forward("children");
  }
  contents() {
    return this.forward("contents");
  }
  at(index: number) {
    return this.forward(index);
  }
  leaf() {
    return this.path.slice(this.path.lastIndexOf(".") + 1 ?? 0);
  }

  toString() {
    return this.path;
  }

  static from(path: string | number) {
    return new Path(`.${path}`);
  }
}
