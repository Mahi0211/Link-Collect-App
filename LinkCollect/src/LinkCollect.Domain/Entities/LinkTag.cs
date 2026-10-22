namespace LinkCollect.Domain.Entities;

public class LinkTag
{
    public int LinkItemId { get; set; }
    public LinkItem? LinkItem { get; set; }

    public int TagId { get; set; }
    public Tag? Tag { get; set; }
}
