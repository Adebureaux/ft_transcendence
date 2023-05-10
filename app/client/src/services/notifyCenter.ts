import { randFloat } from "three/src/math/MathUtils"
import { reactive, ref, Ref} from 'vue';

export type NotifyOptions = {
  type? : string | null
  color? : string | null
  message : string | null
  avatar? : string | null
  timeout?: number
}

interface INotifications {
  id : symbol
  createdAt: Date;
  options: NotifyOptions;
}

export class Notifications implements INotifications {

  id: symbol
  createdAt: Date;
  options: NotifyOptions;

  constructor(options: NotifyOptions) {
    this.id = Symbol()
    this.createdAt = new Date()
    this.options = reactive<NotifyOptions>(options)
  }

}

export class NotifyCenter {

  public notifications = reactive<Map<symbol, Notifications>>(new Map<symbol, Notifications>());
  public quasar: any


  push(options: NotifyOptions) {
    const n = new Notifications(options)
    this.notifications.set(n.id, n)
  }

  pop(id: symbol) {
    this.notifications.delete(id)
  }

  clear() {
    this.notifications.clear()
  }

  getAll() : IterableIterator<Notifications> {
    return this.notifications.values()
  }

  send(options: NotifyOptions) {
    options.timeout = 3000
    this.quasar.notify(options)
    this.push(options)
  }

  init(quasar: any) {
    this.quasar = quasar
    this.send({
      type: 'positive',
      message: 'Welcome back ! Ready to lose ? :)'
    })
  }

}

const nc = new NotifyCenter()

export default nc
