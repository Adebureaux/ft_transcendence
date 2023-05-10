import {
  Blocking,
  Channel,
  ChannelSubscription,
  FollowedBy,
  Following,
  Message,
  StoreData,
  SubscribedUser,
  ChannelType,
} from "./store.types";

export class Convert {
  public static toStoreData(json: string): StoreData {
    return cast(JSON.parse(json), r("StoreData"));
  }
  public static toStoreData2(data: object): StoreData {
    return cast(data, r("StoreData"));
  }

  public static toChannelSubscription(json: string): ChannelSubscription {
    return cast(JSON.parse(json), r("ChannelSubscription"));
  }
  public static toChannelSubscription2(data: object): ChannelSubscription {
    return cast(data, r("ChannelSubscription"));
  }

  public static toChannel(json: string): Channel {
    return cast(JSON.parse(json), r("Channel"));
  }
  public static toChannel2(data: object): Channel {
    return cast(data, r("Channel"));
  }

  public static toMessage(json: string): Message {
    return cast(JSON.parse(json), r("Message"));
  }
  public static toMessage2(data: object): Message {
    return cast(data, r("Message"));
  }

  public static toSubscribedUser(json: string): SubscribedUser {
    return cast(JSON.parse(json), r("SubscribedUser"));
  }
  public static toSubscribedUser2(data: object): SubscribedUser {
    return cast(data, r("SubscribedUser"));
  }

  public static toFollowedBy(json: string): FollowedBy {
    return cast(JSON.parse(json), r("FollowedBy"));
  }
  public static toFollowedBy2(data: object): FollowedBy {
    return cast(data, r("FollowedBy"));
  }

  public static toFollowing(json: string): Following {
    return cast(JSON.parse(json), r("Following"));
  }

  public static toFollowing2(data: object): Following {
    return cast(data, r("Following"));
  }

  public static toBlocking(json: string): Blocking {
    return cast(JSON.parse(json), r("Blocking"));
  }

  public static toBlocking2(data: object): Blocking {
    return cast(data, r("Blocking"));
  }
}

function invalidValue(typ: any, val: any, key: any, parent: any = ""): never {
  const prettyTyp = prettyTypeName(typ);
  const parentText = parent ? ` on ${parent}` : "";
  const keyText = key ? ` for key "${key}"` : "";
  throw Error(
    `Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(
      val
    )}`
  );
}

function prettyTypeName(typ: any): string {
  if (Array.isArray(typ)) {
    if (typ.length === 2 && typ[0] === undefined) {
      return `an optional ${prettyTypeName(typ[1])}`;
    } else {
      return `one of [${typ
        .map((a) => {
          return prettyTypeName(a);
        })
        .join(", ")}]`;
    }
  } else if (typeof typ === "object" && typ.literal !== undefined) {
    return typ.literal;
  } else {
    return typeof typ;
  }
}

function jsonToJSProps(typ: any): any {
  if (typ.jsonToJS === undefined) {
    const map: any = {};
    typ.props.forEach((p: any) => (map[p.json] = { key: p.js, typ: p.typ }));
    typ.jsonToJS = map;
  }
  return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
  if (typ.jsToJSON === undefined) {
    const map: any = {};
    typ.props.forEach((p: any) => (map[p.js] = { key: p.json, typ: p.typ }));
    typ.jsToJSON = map;
  }
  return typ.jsToJSON;
}

function transform(
  val: any,
  typ: any,
  getProps: any,
  key: any = "",
  parent: any = ""
): any {
  function transformPrimitive(typ: string, val: any): any {
    if (typeof typ === typeof val) return val;
    return invalidValue(typ, val, key, parent);
  }

  function transformUnion(typs: any[], val: any): any {
    // val must validate against one typ in typs
    const l = typs.length;
    for (let i = 0; i < l; i++) {
      const typ = typs[i];
      try {
        return transform(val, typ, getProps);
      } catch (_) {}
    }
    return invalidValue(typs, val, key, parent);
  }

  function transformEnum(cases: string[], val: any): any {
    if (cases.indexOf(val) !== -1) return val;
    return invalidValue(
      cases.map((a) => {
        return l(a);
      }),
      val,
      key,
      parent
    );
  }

  function transformArray(typ: any, val: any): any {
    // val must be an array with no invalid elements
    if (!Array.isArray(val)) return invalidValue(l("array"), val, key, parent);
    return val.map((el) => transform(el, typ, getProps));
  }

  function transformDate(val: any): any {
    if (val === null) {
      return null;
    }
    const d = new Date(val);
    if (isNaN(d.valueOf())) {
      return invalidValue(l("Date"), val, key, parent);
    }
    return d;
  }

  function transformObject(
    props: { [k: string]: any },
    additional: any,
    val: any
  ): any {
    if (val === null || typeof val !== "object" || Array.isArray(val)) {
      return invalidValue(l(ref || "object"), val, key, parent);
    }
    const result: any = {};
    Object.getOwnPropertyNames(props).forEach((key) => {
      const prop = props[key];
      const v = Object.prototype.hasOwnProperty.call(val, key)
        ? val[key]
        : undefined;
      result[prop.key] = transform(v, prop.typ, getProps, key, ref);
    });
    Object.getOwnPropertyNames(val).forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(props, key)) {
        result[key] = transform(val[key], additional, getProps, key, ref);
      }
    });
    return result;
  }

  if (typ === "any") return val;
  if (typ === null) {
    if (val === null) return val;
    return invalidValue(typ, val, key, parent);
  }
  if (typ === false) return invalidValue(typ, val, key, parent);
  let ref: any = undefined;
  while (typeof typ === "object" && typ.ref !== undefined) {
    ref = typ.ref;
    typ = typeMap[typ.ref];
  }
  if (Array.isArray(typ)) return transformEnum(typ, val);
  if (typeof typ === "object") {
    return typ.hasOwnProperty("unionMembers")
      ? transformUnion(typ.unionMembers, val)
      : typ.hasOwnProperty("arrayItems")
      ? transformArray(typ.arrayItems, val)
      : typ.hasOwnProperty("props")
      ? transformObject(getProps(typ), typ.additional, val)
      : invalidValue(typ, val, key, parent);
  }
  // Numbers can be parsed by Date but shouldn't be.
  if (typ === Date && typeof val !== "number") return transformDate(val);
  return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
  return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
  return transform(val, typ, jsToJSONProps);
}

function l(typ: any) {
  return { literal: typ };
}

function a(typ: any) {
  return { arrayItems: typ };
}

function u(...typs: any[]) {
  return { unionMembers: typs };
}

function o(props: any[], additional: any) {
  return { props, additional };
}

function m(additional: any) {
  return { props: [], additional };
}

function r(name: string) {
  return { ref: name };
}

const typeMap: any = {
  StoreData: o(
    [
      { json: "username", js: "username", typ: u(undefined, "") },
      { json: "email", js: "email", typ: u(undefined, "") },
      { json: "TwoFA", js: "twoFA", typ: u(undefined, true) },
      { json: "createdAt", js: "createdAt", typ: u(undefined, Date) },
      { json: "updatedAt", js: "updatedAt", typ: u(undefined, Date) },
      {
        json: "victoriesAsPOne",
        js: "victoriesAsPOne",
        typ: u(undefined, 0),
      },
      {
        json: "victoriesAsPTwo",
        js: "victoriesAsPTwo",
        typ: u(undefined, 0),
      },
      {
        json: "defeatsAsPOne",
        js: "defeatsAsPOne",
        typ: u(undefined, 0),
      },
      {
        json: "defeatsAsPTwo",
        js: "defeatsAsPTwo",
        typ: u(undefined, 0),
      },
      {
        json: "channelSubscriptions",
        js: "channelSubscriptions",
        typ: u(undefined, a(r("ChannelSubscription"))),
      },
      {
        json: "followedBy",
        js: "followedBy",
        typ: u(undefined, a(r("FollowedBy"))),
      },
      {
        json: "following",
        js: "following",
        typ: u(undefined, a(r("Following"))),
      },
      {
        json: "blocking",
        js: "blocking",
        typ: u(undefined, a(r("Blocking"))),
      },
    ],
    false
  ),
  Blocking: o(
    [
      { json: "blockingId", js: "blockingId", typ: u(undefined, "") },
      { json: "id", js: "id", typ: u(undefined, "") },
    ],
    false
  ),
  ChannelSubscription: o(
    [
      { json: "channelId", js: "channelId", typ: u(undefined, "") },
      { json: "role", js: "role", typ: u(undefined, r("Role")) },
      {
        json: "stateActiveUntil",
        js: "stateActiveUntil",
        typ: u(undefined, u(Date, null)),
      },
      { json: "state", js: "state", typ: u(undefined, r("State")) },
      { json: "channel", js: "channel", typ: u(undefined, r("Channel")) },
    ],
    false
  ),
  Channel: o(
    [
      {
        json: "subscribedUsers",
        js: "subscribedUsers",
        typ: u(undefined, a(r("SubscribedUser"))),
      },
      { json: "id", js: "id", typ: u(undefined, "") },
      { json: "name", js: "name", typ: u(undefined, "") },
      {
        json: "channelType",
        js: "channelType",
        typ: u(undefined, "ChannelType"),
      },
      { json: "hash", js: "hash", typ: u(undefined, u(null, "")) },
      {
        json: "passwordProtected",
        js: "passwordProtected",
        typ: u(undefined, true),
      },
      {
        json: "messages",
        js: "messages",
        typ: u(undefined, a(r("Message"))),
      },
    ],
    false
  ),
  Message: o(
    [
      { json: "id", js: "id", typ: 0 },
      { json: "CreatedAt", js: "CreatedAt", typ: u(undefined, Date) },
      { json: "ReceivedAt", js: "ReceivedAt", typ: u(undefined, Date) },
      { json: "content", js: "content", typ: u(undefined, "") },
      { json: "username", js: "username", typ: u(undefined, "") },
      { json: "channelId", js: "channelId", typ: u(undefined, "") },
    ],
    false
  ),
  SubscribedUser: o(
    [
      { json: "username", js: "username", typ: u(undefined, "") },
      { json: "role", js: "role", typ: u(undefined, r("Role")) },
      { json: "state", js: "state", typ: u(undefined, r("State")) },
      {
        json: "stateActiveUntil",
        js: "stateActiveUntil",
        typ: u(undefined, u(Date, null)),
      },
    ],
    false
  ),
  FollowedBy: o(
    [
      { json: "followerId", js: "followerId", typ: u(undefined, "") },
      { json: "id", js: "id", typ: u(undefined, "") },
    ],
    false
  ),
  Following: o(
    [
      { json: "followingId", js: "followingId", typ: u(undefined, "") },
      { json: "id", js: "id", typ: u(undefined, "") },
    ],
    false
  ),
  Role: ["ADMIN", "OWNER", "USER"],
  State: ["BANNED", "MUTED", "OK"],
  ChannelType: ["PUBLIC", "PRIVATE", "ONE_TO_ONE"],
};
