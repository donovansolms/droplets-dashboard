package models

import (
	"time"
)

type DropletLeaderboard struct {
	ID          uint64    `gorm:"primary_key"`
	Address     string    `gorm:"column:address"`
	Droplets    uint64    `gorm:"column:droplets"`
	Height      int64     `gorm:"column:height"`
	DateBlock   time.Time `gorm:"column:date_block"`
	DateCreated time.Time `gorm:"column:date_created"`
}

func (DropletLeaderboard) TableName() string {
	return "droplet_leaderboard"
}
