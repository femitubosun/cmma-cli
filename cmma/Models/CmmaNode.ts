export default class CmmaNode {
  constructor(private nodeLabel: string) {}

  public get label() {
    return this.nodeLabel
  }

  public set label(text: string) {
    this.nodeLabel = text
  }
}
