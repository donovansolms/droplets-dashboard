package models

import (
	"time"
)

type DropAtomHistory struct {
	ID          uint64    `gorm:"primary_key"`
	TotalAtom   uint64    `gorm:"column:total_atom"`
	Height      int64     `gorm:"column:height"`
	DateBlock   time.Time `gorm:"column:date_block"`
	DateCreated time.Time `gorm:"column:date_created"`
}

func (DropAtomHistory) TableName() string {
	return "drop_atom_history"
}
