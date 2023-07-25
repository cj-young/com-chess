class QueueNode<T> {
  data: T;
  next: QueueNode<T> | null;
  id: number;
  constructor(data: any, id: number) {
    this.data = data;
    this.next = null;
    this.id = id;
  }
}

export default class Queue<T> {
  first: QueueNode<T> | null;
  last: QueueNode<T> | null;
  size: number;
  count: number;
  constructor() {
    this.first = null;
    this.last = null;
    this.size = 0;
    this.count = 0;
  }

  enqueue(data: T): void {
    const node = new QueueNode<T>(data, this.count);

    if (!this.first || !this.last) {
      this.first = node;
      this.last = node;
    } else {
      this.last.next = node;
      this.last = node;
    }

    this.size++;
    this.count++;
  }

  dequeue(): QueueNode<T> | null {
    if (!this.first) return null;
    const node = this.first;

    if (node.next) {
      this.first = node.next;
    } else {
      this.first = null;
      this.last = null;
    }

    this.size--;
    return node;
  }
}
