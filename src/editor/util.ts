import _ from "lodash";
import Path from "./Path";

export function customizer(objValue: any, srcValue: any) {
  if (_.isArray(objValue)) {
    return objValue.concat(srcValue);
  }
}

export function accessor(obj: any, path: Path): any {
  const parts = path
    .toString()
    .split(".")
    .filter((part) => part !== "");

  let value = obj;
  for (let part of parts) {
    if (value === undefined || value === null) {
      return null;
    }

    value = value[part];
  }

  return value;
}
