import React, { useState } from "react"
import useTimeout from "~/hooks/useTimeout"
import cfetch from "~/lib/cfetch"
import { CButton, TextButton } from "~/mui-c/Button"
import { ConfirmDialog } from "~/mui-c/Dialog"
import { IShoppingItem } from "~/types"
import { useStore } from "~/zustand"
import Image from "next/image"

interface ShoppingItemInfoProps {
  item: IShoppingItem
}

const ShoppingItemInfo: React.FC<ShoppingItemInfoProps> = ({ item }) => {
  const [confirmDialogOpen, setConfirmDialog] = useState(false)
  const [formError, setFormError] = useState("")
  const [loading, setLoading] = useState(false)
  const dispatchList = useStore((state) => state.dispatchList)
  const dispatchItem = useStore((state) => state.dispatchItem)
  const dispatchDrawer = useStore((state) => state.dispatchDrawer)
  const [addedToList, setAddedToList] = useState(false)
  const [buttonTimeout, setButtonTimeout] = useState<number | null>(null)
  useTimeout(() => {
    setAddedToList(false)
  }, buttonTimeout)

  const handleConfirmDialogClose = () => {
    setConfirmDialog(false)
  }
  const handleAddToList = () => {
    dispatchList({
      type: "list:add-item",
      payload: {
        itemCategory: item.category,
        itemName: item.name,
        quantity: 1,
        shoppingItemId: item.id,
      },
    })
    setAddedToList(true)
    setButtonTimeout(2000)
  }
  const handleDelete = async () => {
    setFormError("")
    try {
      setLoading(true)
      await cfetch(`/api/items/${item.id}`, {
        method: "DELETE",
        outputType: "string",
      })
      dispatchItem({
        type: "item:delete",
        payload: {
          category: item.category,
          itemId: item.id,
        },
      })
      dispatchList({
        type: "list:delete-item",
        payload: {
          itemCategory: item.category,
          shoppingItemId: item.id,
        },
      })
      dispatchDrawer({
        type: "drawer:set",
        payload: "create-list",
      })
    } catch (err) {
      console.error(err)
      setFormError("something went wrong!")
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="wrapper">
      <button
        className="back"
        onClick={() =>
          dispatchDrawer({ type: "drawer:set", payload: "create-list" })
        }
      >
        &#8656; back
      </button>
      <div className="item styled-scrollbars">
        <div className="item__inner">
          <div className="item__picture">
            <Image
              src="/avocado.jpg"
              alt="avocado single and halved"
              width={300}
              height={220}
            />
          </div>
          <div className="item__details">
            <dl>
              <div className="title">
                <dt>name</dt>
                <dd>{item.name}</dd>
              </div>
              <div>
                <dt>category</dt>
                <dd>{item.category}</dd>
              </div>
              <div>
                <dt>note</dt>
                <dd>{item.note || ""}</dd>
              </div>
            </dl>
          </div>
        </div>
        <div className="item__cta">
          {formError && <p className="error">{formError}</p>}
          <TextButton
            variant="text"
            onClick={() => setConfirmDialog(true)}
            disabled={loading}
          >
            {loading ? "loading..." : "delete"}
          </TextButton>
          <CButton
            sx={{
              fontSize: "1.5rem",
              padding: "1rem 1.5rem",
              marginLeft: "2rem",
            }}
            onClick={handleAddToList}
          >
            {addedToList ? "Added" : "Add to list"}
          </CButton>
        </div>
        <ConfirmDialog
          open={confirmDialogOpen}
          onClose={handleConfirmDialogClose}
          onYes={handleDelete}
        >
          Are you sure want to delete this item?
        </ConfirmDialog>
      </div>
      <style jsx>{`
        .wrapper {
          display: flex;
          flex-direction: column;
          background: var(--clr-white);
          padding: 4rem;
          height: 100%;
          overflow-y: scroll;
        }
        .back {
          color: var(--clr-amber10);
          font-size: 1.5rem;
          font-weight: 500;
          line-height: 1.7rem;
          text-align: left;
          margin: 1.5rem 0;
          text-decoration: underline;
        }
        .item {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 2rem;
          height: 100%;
          overflow-y: scroll;
        }
        .item__picture {
          width: 100%;
          height: auto;
          margin-bottom: 2rem;
        }
        img {
          object-fit: contain;
          border-radius: 2.5rem;
        }
        dl {
          font-weight: 500;
        }
        dl div + div {
          margin-top: 3rem;
        }
        dt {
          color: var(--clr-gray10);
          font-size: 1.2rem;
          margin: 0.5rem 0;
        }
        .title dd {
          font-size: 2.4rem;
          line-height: 3rem;
        }
        dd {
          font-size: 1.8rem;
          line-height: 2.2rem;
        }
        .item__cta {
          text-align: center;
        }

        @media (max-width: 768px) {
          .wrapper {
            padding: 1rem;
          }
          .title dd {
            font-size: 1.8rem;
          }
          dd {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  )
}

export default ShoppingItemInfo
